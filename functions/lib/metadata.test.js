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

import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  absolutize,
  clamp,
  mapWithConcurrency,
  parseMetadata
} = require("./metadata");

const BASE = "https://example.com/blog/post";

describe("parseMetadata", () => {
  it("prefers twitter tags, then openGraph, then the bare title", () => {
    const html = `
      <html><head>
        <title>Bare title</title>
        <meta property="og:title" content="OG title" />
        <meta name="twitter:title" content="Twitter title" />
      </head></html>`;
    expect(parseMetadata(html, BASE).title).toBe("Twitter title");

    const noTwitter = `
      <html><head>
        <title>Bare title</title>
        <meta property="og:title" content="OG title" />
      </head></html>`;
    expect(parseMetadata(noTwitter, BASE).title).toBe("OG title");

    expect(parseMetadata("<html><head><title>Bare</title></head></html>", BASE).title).toBe(
      "Bare"
    );
  });

  it("returns empty strings rather than undefined for a bare document", () => {
    const parsed = parseMetadata("<html><head></head><body>hi</body></html>", BASE);
    expect(parsed.title).toBe("");
    expect(parsed.snippet).toBe("");
    expect(parsed.imageUrl).toBe("");
  });

  it("collapses whitespace in extracted text", () => {
    const html = "<html><head><title>  spaced   out \n title </title></head></html>";
    expect(parseMetadata(html, BASE).title).toBe("spaced out title");
  });
});

describe("absolutize", () => {
  // The original code only handled a leading "/", so protocol-relative and
  // document-relative image paths silently produced broken thumbnails.
  it("resolves root-relative, document-relative and protocol-relative urls", () => {
    expect(absolutize("/icon.png", BASE)).toBe("https://example.com/icon.png");
    expect(absolutize("icon.png", BASE)).toBe(
      "https://example.com/blog/icon.png"
    );
    expect(absolutize("//cdn.example.com/i.png", BASE)).toBe(
      "https://cdn.example.com/i.png"
    );
  });

  it("passes through absolute http(s) urls unchanged", () => {
    expect(absolutize("https://cdn.example.com/i.png", BASE)).toBe(
      "https://cdn.example.com/i.png"
    );
  });

  // These end up in an href/src in the client, so a javascript: URL that
  // survived here would be a stored XSS vector.
  it.each(["javascript:alert(1)", "data:text/html,<script>", "file:///etc/passwd"])(
    "rejects the dangerous scheme %s",
    (value) => {
      expect(absolutize(value, BASE)).toBe("");
    }
  );

  it("rejects junk instead of throwing", () => {
    expect(absolutize("", BASE)).toBe("");
    expect(absolutize(null, BASE)).toBe("");
    expect(absolutize("http://", BASE)).toBe("");
  });
});

describe("clamp", () => {
  // Admin SDK writes bypass security rules, so the size ceiling has to be
  // enforced in code or a hostile page could bloat the collection document.
  it("truncates to the limit", () => {
    expect(clamp("x".repeat(300), 200)).toHaveLength(200);
  });

  it("normalizes whitespace and tolerates non-strings", () => {
    expect(clamp("  a   b  ", 100)).toBe("a b");
    expect(clamp(undefined, 100)).toBe("");
    expect(clamp(42, 100)).toBe("");
  });
});

describe("mapWithConcurrency", () => {
  it("returns results in input order regardless of completion order", async () => {
    const delays = [30, 5, 20, 1];
    const results = await mapWithConcurrency(delays, 2, async (ms, i) => {
      await new Promise((r) => setTimeout(r, ms));
      return i;
    });
    expect(results.map((r) => r.value)).toEqual([0, 1, 2, 3]);
  });

  it("isolates failures instead of aborting the batch", async () => {
    const results = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error("boom");
      return n;
    });
    expect(results[0]).toMatchObject({ status: "fulfilled", value: 1 });
    expect(results[1].status).toBe("rejected");
    expect(results[2]).toMatchObject({ status: "fulfilled", value: 3 });
  });

  it("never exceeds the concurrency limit", async () => {
    let active = 0;
    let peak = 0;
    await mapWithConcurrency(Array.from({ length: 20 }), 4, async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active -= 1;
    });
    expect(peak).toBeLessThanOrEqual(4);
  });

  it("handles an empty input list", async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });
});
