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

const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { setGlobalOptions } = require("firebase-functions/v2");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated
} = require("firebase-functions/v2/firestore");

const {
  getUrlMetadata: fetchMetadata,
  mapWithConcurrency,
  clamp
} = require("./lib/metadata");
const { consume } = require("./lib/rateLimit");

admin.initializeApp();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: "256MiB"
});

// App Check proves calls come from the real web app rather than a script.
// Kept switchable because turning it on is a production behaviour change: if
// any client is still running a build without App Check it will start failing.
// Deploy with ENFORCE_APP_CHECK=false first if you want a staged rollout.
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK !== "false";

// Mirrors SHORT_URL_REGEX in the web client and isValidGroupId() in
// firestore.rules. All three must agree.
const GROUP_ID_REGEX = /^[a-zA-Z0-9+-]{6,64}$/;

const MAX_ITEMS_PER_GROUP = 50;
const METADATA_CONCURRENCY = 5;

const CALLABLE_OPTS = { enforceAppCheck: ENFORCE_APP_CHECK, cors: true };

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function requireAuth(request) {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in to perform this action."
    );
  }
  return uid;
}

function requireGroupId(value) {
  if (typeof value !== "string" || !GROUP_ID_REGEX.test(value)) {
    throw new HttpsError(
      "invalid-argument",
      "A valid collection id is required."
    );
  }
  return value;
}

/**
 * Logs the real cause but returns a generic message to the caller.
 * The previous implementation interpolated the raw error into the response,
 * leaking internal paths and upstream error text to anyone who asked.
 */
function internalError(message, err) {
  logger.error(message, err);
  return new HttpsError("internal", message);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// callables
// ---------------------------------------------------------------------------

/**
 * Fetches link-preview metadata for a single URL.
 *
 * Previously this was callable by anyone with no limits and would fetch any
 * URL, including http://169.254.169.254/ (the GCP metadata server). It now
 * requires auth + App Check, is rate limited, and goes through safeFetchHtml.
 */
exports.getUrlMetadata = onCall(CALLABLE_OPTS, async (request) => {
  const uid = requireAuth(request);

  // Tolerate the pre-2.0 calling convention, which passed a bare string.
  const url =
    typeof request.data === "string" ? request.data : request.data?.url;

  if (typeof url !== "string" || url.trim().length === 0) {
    throw new HttpsError("invalid-argument", "A url is required.");
  }

  const quota = await consume(db, uid, "metadata", {
    limit: 120,
    windowMs: 60 * 60 * 1000
  });
  if (!quota.allowed) {
    throw new HttpsError(
      "resource-exhausted",
      "Too many link previews requested. Please try again later."
    );
  }

  try {
    const { metadata } = await fetchMetadata(db, url);
    return metadata;
  } catch (err) {
    // A site being unreachable is the caller's problem, not a server fault —
    // reporting it as "internal" made every dead link look like an outage.
    logger.warn(`Metadata fetch failed for ${url}: ${err.message}`);
    throw new HttpsError("not-found", "Could not read a preview from that URL.");
  }
});

/**
 * Backfills metadata for every item in a collection.
 *
 * The previous version took a raw Firestore document path from the client and
 * ran db.doc(path).get()/.set() with Admin SDK privileges — an arbitrary read
 * and write of any document in the project. It now takes a collection id,
 * validates it, and checks that the caller owns the collection.
 */
exports.populateUrlMetadata = onCall(CALLABLE_OPTS, async (request) => {
  const uid = requireAuth(request);

  // Accept the legacy `DataGroups/<id>` path shape, but only ever trust the
  // final segment, and only after it passes the id whitelist.
  const raw =
    typeof request.data === "string" ? request.data : request.data?.groupId;
  const candidate =
    typeof raw === "string" && raw.startsWith("DataGroups/")
      ? raw.slice("DataGroups/".length)
      : raw;
  const groupId = requireGroupId(candidate);

  const docRef = db.collection("DataGroups").doc(groupId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", `No collection found at /${groupId}`);
  }

  const data = snapshot.data();
  if (data.ownerId !== uid && data.ownerId !== "PUBLIC") {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to edit this collection."
    );
  }

  const items = { ...(data.items || {}) };
  const entries = Object.entries(items).slice(0, MAX_ITEMS_PER_GROUP);

  // Only fetch for items that are actually missing something.
  const pending = entries.filter(
    ([, item]) => item?.link && (!item.title || !item.snippet || !item.imageUrl)
  );

  if (pending.length === 0) {
    return { items, updated: 0 };
  }

  const quota = await consume(db, uid, "metadata", {
    limit: 120,
    windowMs: 60 * 60 * 1000,
    cost: pending.length
  });
  if (!quota.allowed) {
    throw new HttpsError(
      "resource-exhausted",
      "Too many link previews requested. Please try again later."
    );
  }

  const results = await mapWithConcurrency(
    pending,
    METADATA_CONCURRENCY,
    async ([itemId, item]) => {
      const { metadata } = await fetchMetadata(db, item.link);
      return { itemId, item, metadata };
    }
  );

  const update = {};
  let updated = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") {
      logger.warn(`Skipping item metadata: ${result.reason?.message}`);
      continue;
    }
    const { itemId, item, metadata } = result.value;
    const merged = {
      ...item,
      // Never overwrite something the user typed themselves.
      title: item.title || clamp(metadata.title, 200),
      snippet: item.snippet || clamp(metadata.snippet, 500),
      imageUrl: item.imageUrl || metadata.imageUrl || ""
    };
    items[itemId] = merged;
    update[`items.${itemId}`] = merged;
    updated += 1;
  }

  if (updated > 0) {
    try {
      // Targeted field updates rather than a whole-document set(), so a
      // concurrent edit to another item is not clobbered.
      await docRef.update(update);
    } catch (err) {
      throw internalError("Failed to save link previews.", err);
    }
  }

  return { items, updated };
});

// ---------------------------------------------------------------------------
// Domains mirror
// ---------------------------------------------------------------------------
//
// Domains/{groupId} is a denormalized index powering the "My Lists" screen.
// Keeping it in triggers means the client never needs write access to it.

exports.createDomainDocument = onDocumentCreated(
  "DataGroups/{groupId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    try {
      await db.collection("Domains").doc(event.params.groupId).set({
        title: data.title || "No Title",
        ownerId: data.ownerId || "NO_OWNER"
      });
    } catch (err) {
      logger.error(`Failed to mirror Domains/${event.params.groupId}`, err);
    }
  }
);

/**
 * Keeps the mirror in step with renames.
 *
 * Without this the "My Lists" screen showed the title a list had on the day it
 * was created — which is why renaming was disabled in the UI.
 *
 * The list is compared with the mirror as it stands, not with the list's
 * previous version: lists renamed before this trigger existed have a stale
 * mirror that a "did the title just change?" check would never repair. Now
 * any edit heals it, and an up-to-date mirror costs a read rather than a
 * write.
 */
exports.updateDomainDocument = onDocumentUpdated(
  "DataGroups/{groupId}",
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;

    const mirror = {
      title: after.title || "No Title",
      ownerId: after.ownerId || "NO_OWNER"
    };
    const ref = db.collection("Domains").doc(event.params.groupId);

    try {
      const current = await ref.get();
      const data = current.data();
      if (
        current.exists &&
        data.title === mirror.title &&
        data.ownerId === mirror.ownerId
      ) {
        return;
      }
      await ref.set(mirror, { merge: true });
    } catch (err) {
      logger.error(`Failed to sync Domains/${event.params.groupId}`, err);
    }
  }
);

exports.deleteDomainDocument = onDocumentDeleted(
  "DataGroups/{groupId}",
  async (event) => {
    try {
      await db.collection("Domains").doc(event.params.groupId).delete();
    } catch (err) {
      logger.error(`Failed to remove Domains/${event.params.groupId}`, err);
    }
  }
);

// ---------------------------------------------------------------------------
// server-rendered link previews
// ---------------------------------------------------------------------------

// The SPA shell is copied next to this file at build time by
// scripts/sync-shell.js. Read once per cold start.
let shellCache = null;

function loadShell() {
  if (shellCache !== null) return shellCache;
  try {
    shellCache = fs.readFileSync(path.join(__dirname, "shell.html"), "utf8");
  } catch (err) {
    logger.error("SPA shell missing — run scripts/sync-shell.js", err);
    shellCache = "";
  }
  return shellCache;
}

/**
 * Serves a collection page with real OpenGraph tags baked into the HTML.
 *
 * GoList's whole premise is sharing one short URL, but as a client-rendered
 * SPA every shared link previewed as a blank card in Slack, iMessage and
 * Twitter — crawlers do not run JavaScript. This injects per-collection
 * metadata into the shell, then leans on the Hosting CDN (s-maxage) so the
 * function stays out of the hot path for repeat views.
 */
exports.renderCollection = onRequest(
  { region: "us-central1", maxInstances: 10, memory: "256MiB" },
  async (req, res) => {
    const shell = loadShell();

    if (!shell) {
      res.status(500).send("Application shell unavailable.");
      return;
    }

    const serveShell = (html, sMaxAge) => {
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", `public, max-age=60, s-maxage=${sMaxAge}`);
      res.set("X-Content-Type-Options", "nosniff");
      res.status(200).send(html);
    };

    let collectionId = "";
    try {
      collectionId = decodeURIComponent(
        (req.path || "/").split("/").filter(Boolean)[0] || ""
      );
    } catch {
      // A malformed percent-escape is not a collection id.
      collectionId = "";
    }

    // Anything that is not a plausible collection id just gets the plain app.
    if (!GROUP_ID_REGEX.test(collectionId)) {
      serveShell(shell, 300);
      return;
    }

    let title = "GoList";
    let description =
      "Quickly browse a collection of links or files with one short URL.";

    try {
      const snapshot = await db
        .collection("DataGroups")
        .doc(collectionId)
        .get();
      if (snapshot.exists) {
        const data = snapshot.data();
        const itemCount = Object.keys(data.items || {}).length;
        title = data.title || title;
        description = `${itemCount} link${
          itemCount === 1 ? "" : "s"
        } collected on GoList.`;
      }
    } catch (err) {
      // A metadata lookup failure should still serve a working app.
      logger.error(`renderCollection lookup failed for ${collectionId}`, err);
    }

    const canonical = `https://goli.st/${collectionId}`;
    const tags = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}" />`,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="GoList" />`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
      `<meta name="twitter:card" content="summary" />`,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    ].join("\n    ");

    // index.html ships placeholder title/description/OpenGraph tags for the
    // routes that never reach this function. They have to come out before the
    // real ones go in, or a crawler sees two of each and picks whichever it
    // likes — usually the generic one.
    const html = shell
      .replace(/<title>[\s\S]*?<\/title>/gi, "")
      .replace(
        /<meta\s+[^>]*?(?:name=["'](?:description|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*?>/gi,
        ""
      )
      .replace("</head>", `    ${tags}\n  </head>`);

    serveShell(html, 600);
  }
);
