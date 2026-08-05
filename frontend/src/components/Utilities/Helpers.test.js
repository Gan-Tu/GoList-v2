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
import {
  displayHost,
  fixUrl,
  safeHref,
  validateShortUrl
} from "./Helpers";

describe("fixUrl", () => {
  it("upgrades a bare host to https, not http", () => {
    expect(fixUrl("example.com")).toBe("https://example.com");
  });

  it("leaves an explicit scheme alone", () => {
    expect(fixUrl("http://example.com")).toBe("http://example.com");
    expect(fixUrl("https://example.com")).toBe("https://example.com");
  });

  it("tolerates empty and non-string input", () => {
    expect(fixUrl("")).toBe("");
    expect(fixUrl("   ")).toBe("");
    expect(fixUrl(null)).toBe("");
    expect(fixUrl(undefined)).toBe("");
  });
});

describe("safeHref", () => {
  // Item links are stored in Firestore by one user and rendered in another
  // user's browser, so a javascript: URL here would be stored XSS.
  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)"
  ])("refuses to produce an href for %s", (url) => {
    expect(safeHref(url)).toBe("");
  });

  it("passes through ordinary web links", () => {
    expect(safeHref("https://example.com/a")).toBe("https://example.com/a");
    expect(safeHref("example.com")).toBe("https://example.com/");
  });

  it("returns empty for junk rather than throwing", () => {
    expect(safeHref("")).toBe("");
    expect(safeHref(null)).toBe("");
  });
});

describe("displayHost", () => {
  it("strips the scheme, path and leading www", () => {
    expect(displayHost("https://www.example.com/a/b?c=1")).toBe("example.com");
    expect(displayHost("http://sub.example.co.uk/x")).toBe("sub.example.co.uk");
  });
});

describe("validateShortUrl", () => {
  it("accepts a valid short url", () => {
    expect(validateShortUrl("my-list")).toBe("");
    expect(validateShortUrl("abc123")).toBe("");
    expect(validateShortUrl("a+b-c1")).toBe("");
  });

  it.each([
    ["", "empty"],
    ["abc", "too short"],
    ["has space", "space"],
    ["has/slash", "slash"],
    ["emoji😀here", "emoji"],
    ["x".repeat(65), "too long"]
  ])("rejects %s (%s)", (value) => {
    expect(validateShortUrl(value)).not.toBe("");
  });
});
