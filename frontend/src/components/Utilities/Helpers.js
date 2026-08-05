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

// Must stay in lockstep with GROUP_ID_REGEX in functions/index.js and
// isValidGroupId() in firestore.rules.
export const SHORT_URL_REGEX = /^[a-zA-Z0-9+-]{6,64}$/;

// Firestore rules permit up to 50 items in a collection; the create form keeps
// the original product limit of 10 links per collection.
export const MAX_ITEMS_PER_COLLECTION = 50;
export const MAX_URLS_PER_CREATE = 10;

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Normalizes user-entered URLs.
 *
 * Bare input is upgraded to https rather than http — the old behaviour sent
 * every scheme-less link over plaintext and left "http://" stored forever.
 */
export function fixUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.length === 0) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Returns a URL safe to place in an href, or "" for anything else.
 * Item links round-trip through Firestore, so a javascript: URL stored by one
 * user would otherwise execute in another user's browser.
 */
export function safeHref(url) {
  if (typeof url !== "string" || url.trim().length === 0) return "";
  try {
    const parsed = new URL(fixUrl(url));
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}

/** "https://example.com/a/b?c" -> "example.com" */
export function displayHost(url) {
  try {
    return new URL(fixUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

export function validateShortUrl(shortUrl) {
  if (!shortUrl) return "Collection URL is empty but required.";
  if (shortUrl.length < 6) return "Collection URL must be at least 6 characters.";
  if (shortUrl.length > 64) return "Collection URL must be 64 characters or fewer.";
  if (!SHORT_URL_REGEX.test(shortUrl)) {
    return "Only letters, numbers, - and + are allowed.";
  }
  return "";
}
