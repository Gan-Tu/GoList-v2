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

import http from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isBlockedAddress, normalizeUrl, safeFetchHtml } = require("./safeFetch");

describe("isBlockedAddress", () => {
  it("blocks the cloud metadata server", () => {
    // The single most valuable SSRF target on GCP: it hands out access tokens.
    expect(isBlockedAddress("169.254.169.254")).toBe(true);
  });

  it.each([
    "127.0.0.1",
    "127.5.5.5",
    "0.0.0.0",
    "10.0.0.1",
    "10.255.255.255",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "100.64.0.1",
    "169.254.1.1",
    "224.0.0.1",
    "255.255.255.255"
  ])("blocks the private/reserved IPv4 address %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each([
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "ff02::1",
    "::ffff:169.254.169.254",
    "::ffff:127.0.0.1"
  ])("blocks the private/reserved IPv6 address %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:4700::1111"])(
    "allows the public address %s",
    (address) => {
      expect(isBlockedAddress(address)).toBe(false);
    }
  );

  it("blocks anything that is not an IP address at all", () => {
    expect(isBlockedAddress("not-an-ip")).toBe(true);
    expect(isBlockedAddress("")).toBe(true);
  });

  // 172.15 and 172.32 sit just outside RFC1918 and must stay reachable.
  it("does not over-block the edges of the 172.16/12 range", () => {
    expect(isBlockedAddress("172.15.255.255")).toBe(false);
    expect(isBlockedAddress("172.32.0.0")).toBe(false);
  });
});

describe("normalizeUrl", () => {
  it("upgrades a bare hostname to https rather than http", () => {
    expect(normalizeUrl("example.com").toString()).toBe("https://example.com/");
  });

  it.each(["file:///etc/passwd", "gopher://x/", "data:text/html,hi", "ftp://x/"])(
    "rejects the non-http scheme %s",
    (url) => {
      expect(() => normalizeUrl(url)).toThrow();
    }
  );

  it("strips embedded credentials", () => {
    // http://user:pass@evil.com is a classic way to confuse naive host parsing.
    const url = normalizeUrl("https://user:pass@example.com/x");
    expect(url.username).toBe("");
    expect(url.password).toBe("");
    expect(url.toString()).toBe("https://example.com/x");
  });

  it("rejects empty and non-string input", () => {
    expect(() => normalizeUrl("")).toThrow();
    expect(() => normalizeUrl(null)).toThrow();
    expect(() => normalizeUrl(undefined)).toThrow();
  });

  // Node skips DNS resolution when the host is already an IP literal, so the
  // guarded lookup never fires for these. They must be rejected up front.
  it.each([
    "http://169.254.169.254/computeMetadata/v1/",
    "http://127.0.0.1:8080/admin",
    "http://10.0.0.1/",
    "http://[::1]:8080/",
    "http://[fd00::1]/"
  ])("rejects the private ip literal %s", (url) => {
    expect(() => normalizeUrl(url)).toThrow();
  });
});

describe("safeFetchHtml against a real loopback server", () => {
  let server;
  let port;

  beforeAll(async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><head><title>internal service</title></head></html>");
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = server.address().port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // This is the real proof: the server is genuinely listening and would answer,
  // so only the connect-time lookup guard prevents the fetch.
  it("refuses to reach a service listening on loopback", async () => {
    await expect(safeFetchHtml(`http://127.0.0.1:${port}/`)).rejects.toThrow();
  });

  it("refuses localhost by name, not just by literal address", async () => {
    await expect(safeFetchHtml(`http://localhost:${port}/`)).rejects.toThrow();
  });

  it("refuses the IPv6 loopback literal", async () => {
    await expect(safeFetchHtml(`http://[::1]:${port}/`)).rejects.toThrow();
  });
});
