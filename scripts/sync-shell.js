#!/usr/bin/env node
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

// Copies the built SPA shell to the functions directory so renderCollection
// can serve it with per-collection OpenGraph tags injected.
//
// This runs after `vite build`, which means functions/shell.html always carries
// the current asset hashes. Fetching the shell over HTTP at runtime would have
// worked too, but it would put a network round-trip on every cold start.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "frontend", "dist", "index.html");
const destination = path.join(root, "functions", "shell.html");

if (!fs.existsSync(source)) {
  console.error(
    `[sync-shell] No build found at ${source}\n` +
      "[sync-shell] Run `npm run build` in frontend/ first."
  );
  process.exit(1);
}

fs.copyFileSync(source, destination);
console.log(
  `[sync-shell] Copied ${path.relative(root, source)} -> ${path.relative(
    root,
    destination
  )}`
);
