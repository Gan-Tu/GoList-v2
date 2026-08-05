// Copyright 2022 Gan Tu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const crypto = require("node:crypto");
const cheerio = require("cheerio");
const { safeFetchHtml } = require("./safeFetch");

// Length caps are enforced here, not only in security rules, because these
// values are written with the Admin SDK — which bypasses rules entirely. A
// hostile page could otherwise return a megabyte of <title> and push the
// collection document toward Firestore's 1 MiB ceiling.
const MAX_TITLE = 200;
const MAX_SNIPPET = 500;
const MAX_URL = 2048;

const CACHE_COLLECTION = "UrlMetadata";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function clamp(value, max) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Turns a possibly-relative asset reference into an absolute http(s) URL.
 * Returns "" for anything else — notably javascript: and data:, which must
 * never reach an href or img src in the client.
 */
function absolutize(value, baseUrl) {
  if (typeof value !== "string" || value.trim().length === 0) return "";
  try {
    const resolved = new URL(value.trim(), baseUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return "";
    }
    const asString = resolved.toString();
    return asString.length > MAX_URL ? "" : asString;
  } catch {
    return "";
  }
}

/**
 * Extracts link-preview fields from an HTML document.
 * Prefers Twitter/OpenGraph tags over the bare <title>/<meta description>.
 */
function parseMetadata(html, finalUrl) {
  const $ = cheerio.load(html);

  const meta = (selector, attr = "content") =>
    $(selector).first().attr(attr) || "";

  const title =
    meta("meta[name='twitter:title']") ||
    meta("meta[property='og:title']") ||
    $("title").first().text() ||
    meta("meta[name='twitter:site']") ||
    meta("meta[property='og:site_name']");

  const snippet =
    meta("meta[name='twitter:description']") ||
    meta("meta[property='og:description']") ||
    meta("meta[name='description']");

  const image =
    meta("meta[name='twitter:image']") ||
    meta("meta[property='og:image']") ||
    meta("link[rel='apple-touch-icon']", "href") ||
    meta("link[rel='icon']", "href") ||
    meta("link[rel='shortcut icon']", "href");

  return {
    url: finalUrl,
    title: clamp(title, MAX_TITLE),
    snippet: clamp(snippet, MAX_SNIPPET),
    imageUrl: absolutize(image, finalUrl),
    siteName: clamp(meta("meta[property='og:site_name']"), MAX_TITLE)
  };
}

function cacheKey(url) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

/**
 * Fetches and parses link metadata, memoised in Firestore.
 *
 * The cache is the single biggest latency win available here: creating a
 * collection re-fetched every URL on every attempt, and popular links (the
 * same YouTube video, the same doc) are fetched over and over across users.
 */
async function getUrlMetadata(db, rawUrl, { useCache = true } = {}) {
  const key = cacheKey(String(rawUrl));
  const cacheRef = db.collection(CACHE_COLLECTION).doc(key);

  if (useCache) {
    try {
      const cached = await cacheRef.get();
      if (cached.exists) {
        const data = cached.data();
        const age = Date.now() - (data.fetchedAt?.toMillis?.() ?? 0);
        if (age < CACHE_TTL_MS && data.metadata) {
          return { metadata: data.metadata, fromCache: true };
        }
      }
    } catch (err) {
      // A cache miss must never fail the request.
      console.warn(`Metadata cache read failed: ${err.message}`);
    }
  }

  const { html, finalUrl } = await safeFetchHtml(rawUrl);
  const metadata = parseMetadata(html, finalUrl);

  try {
    await cacheRef.set({
      url: String(rawUrl),
      metadata,
      fetchedAt: new Date()
    });
  } catch (err) {
    console.warn(`Metadata cache write failed: ${err.message}`);
  }

  return { metadata, fromCache: false };
}

/**
 * Runs `worker` over `items` with bounded concurrency.
 *
 * The original implementation awaited each fetch in a for-loop, so a ten-link
 * collection took the sum of ten round-trips and one slow host could push the
 * whole call into a timeout. Bounded concurrency keeps the wall-clock near the
 * slowest single fetch without opening ten sockets at once.
 */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        try {
          results[index] = { status: "fulfilled", value: await worker(items[index], index) };
        } catch (reason) {
          results[index] = { status: "rejected", reason };
        }
      }
    }
  );

  await Promise.all(runners);
  return results;
}

module.exports = {
  getUrlMetadata,
  parseMetadata,
  mapWithConcurrency,
  clamp,
  absolutize,
  MAX_TITLE,
  MAX_SNIPPET,
  CACHE_COLLECTION
};
