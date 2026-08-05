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

// An HTTP client for fetching URLs that users control.
//
// Anything that fetches a user-supplied URL from a server is an SSRF primitive:
// the request originates inside the trust boundary, so it can reach the GCP
// metadata server (169.254.169.254), loopback services, and anything else on
// the internal network that is unreachable from the public internet.
//
// The defence has four parts, and all four are load-bearing:
//
//   1. Scheme allowlist — no file:, gopher:, data:, ftp:.
//   2. Address validation at *connect* time, via a custom `lookup`. Validating
//      the hostname up front is not enough: DNS can return a public address on
//      the first lookup and a private one on the second (DNS rebinding). By
//      hooking the lookup the socket actually uses, there is no window between
//      the check and the connection.
//   3. Manual redirect handling — every hop is re-validated. A redirect to
//      http://169.254.169.254/ otherwise sails straight past step 2.
//   4. Hard resource caps — timeout, response size, redirect depth — so a slow
//      or enormous response cannot pin a function instance.

const dns = require("node:dns");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const axios = require("axios").default;

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 MiB
const MAX_REDIRECTS = 3;
const USER_AGENT =
  "GoListBot/2.0 (+https://goli.st; link preview fetcher)";

class BlockedAddressError extends Error {
  constructor(message) {
    super(message);
    this.name = "BlockedAddressError";
  }
}

/** URL.hostname wraps IPv6 literals in brackets; net.isIP() does not want them. */
function stripBrackets(hostname) {
  return typeof hostname === "string" && hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

/**
 * Returns true for any address that must never be reachable from a server-side
 * fetch. Covers loopback, RFC1918, link-local (including the cloud metadata
 * endpoint), CGNAT, multicast and the IPv6 equivalents.
 */
function isBlockedAddress(address) {
  const version = net.isIP(address);
  if (version === 0) return true;

  if (version === 4) {
    const octets = address.split(".").map(Number);
    const [a, b] = octets;
    if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
    if (a === 0) return true; // "this" network
    if (a === 10) return true; // RFC1918
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + GCP metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a >= 224) return true; // multicast + reserved + broadcast
    return false;
  }

  const normalized = address.toLowerCase().split("%")[0];
  if (normalized === "::" || normalized === "::1") return true; // unspecified, loopback
  if (normalized.startsWith("fe80")) return true; // link-local
  if (/^f[cd]/.test(normalized)) return true; // unique local (fc00::/7)
  if (normalized.startsWith("ff")) return true; // multicast

  // IPv4-mapped (::ffff:169.254.169.254) must be judged on the embedded v4.
  const mapped = normalized.match(/^::ffff:(.+)$/);
  if (mapped && net.isIP(mapped[1]) === 4) return isBlockedAddress(mapped[1]);

  return false;
}

/**
 * A drop-in replacement for dns.lookup that refuses to resolve to an address
 * the fetcher is not allowed to reach. Node calls this at socket-connect time,
 * which is what makes it immune to DNS rebinding.
 */
function guardedLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);

    const resolved = Array.isArray(addresses) ? addresses : [addresses];
    const permitted = resolved.filter((a) => !isBlockedAddress(a.address));

    if (permitted.length === 0) {
      return callback(
        new BlockedAddressError(
          `Refusing to connect to a private or reserved address for "${hostname}"`
        )
      );
    }

    if (options && options.all) return callback(null, permitted);
    return callback(null, permitted[0].address, permitted[0].family);
  });
}

const httpAgent = new http.Agent({ lookup: guardedLookup, keepAlive: false });
const httpsAgent = new https.Agent({ lookup: guardedLookup, keepAlive: false });

/**
 * Normalizes user input into a URL we are willing to request, or throws.
 * Bare input ("example.com") is upgraded to https rather than http so the
 * first hop is not silently plaintext.
 */
function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    throw new Error("A URL is required");
  }

  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl.trim())
    ? rawUrl.trim()
    : `https://${rawUrl.trim()}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`Not a valid URL: ${rawUrl}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported URL scheme: ${parsed.protocol}`);
  }

  // Node short-circuits DNS when the host is already an IP literal, so the
  // guarded `lookup` below never runs for http://169.254.169.254/ and friends.
  // Literals therefore have to be judged here instead. Note that URL.hostname
  // keeps the brackets on IPv6 ("[::1]"), which net.isIP() does not accept.
  const literal = stripBrackets(parsed.hostname);
  if (net.isIP(literal) !== 0 && isBlockedAddress(literal)) {
    throw new BlockedAddressError(
      `Refusing to connect to a private or reserved address: ${literal}`
    );
  }

  // Credentials in the URL are never needed for a preview fetch and are a
  // convenient way to smuggle a different host past naive parsers.
  parsed.username = "";
  parsed.password = "";

  return parsed;
}

/**
 * Fetches an HTML document from a user-supplied URL under strict limits.
 * Resolves to { finalUrl, html }.
 */
async function safeFetchHtml(rawUrl) {
  let current = normalizeUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await axios.get(current.toString(), {
      timeout: REQUEST_TIMEOUT_MS,
      maxContentLength: MAX_RESPONSE_BYTES,
      maxBodyLength: MAX_RESPONSE_BYTES,
      maxRedirects: 0, // handled below so every hop is re-validated
      responseType: "text",
      httpAgent,
      httpsAgent,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml"
      },
      // 3xx must reach us rather than throwing, and a 404 body is useless.
      validateStatus: (status) => status < 400
    });

    const location = response.headers?.location;
    if (response.status >= 300 && response.status < 400 && location) {
      if (hop === MAX_REDIRECTS) {
        throw new Error("Too many redirects");
      }
      // Resolve relative redirects against the current hop, then re-normalize
      // so the scheme allowlist applies again.
      current = normalizeUrl(new URL(location, current).toString());
      continue;
    }

    const contentType = String(response.headers?.["content-type"] || "");
    if (contentType && !/(text\/html|application\/xhtml)/i.test(contentType)) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    return { finalUrl: current.toString(), html: String(response.data ?? "") };
  }

  throw new Error("Too many redirects");
}

module.exports = {
  safeFetchHtml,
  normalizeUrl,
  isBlockedAddress,
  BlockedAddressError,
  MAX_RESPONSE_BYTES,
  REQUEST_TIMEOUT_MS,
  MAX_REDIRECTS
};
