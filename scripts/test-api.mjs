// Runs only against the disposable Firebase emulator project. Never uses prod.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const projectId = "demo-golist-v2";
for (const key of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) {
  assert.match(process.env[key] || "", /^(127\.0\.0\.1|localhost):\d+$/, `${key} must be local`);
}
assert.equal(process.env.GCLOUD_PROJECT, projectId);
const require = createRequire(new URL("../functions/package.json", import.meta.url));
const { initializeApp, deleteApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const app = initializeApp({ projectId });
const db = getFirestore(app);
const base = `http://127.0.0.1:5001/${projectId}/us-central1`;

async function call(name, data, token) {
  const response = await fetch(`${base}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ data }),
    signal: AbortSignal.timeout(20000)
  });
  return { status: response.status, body: await response.json() };
}

async function waitFor(check) {
  for (let i = 0; i < 60; i++) {
    if (await check()) return;
    await delay(250);
  }
  assert.fail("Firestore mirror did not converge");
}

try {
  const signUp = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true })
  });
  assert.equal(signUp.status, 200);
  const { idToken, localId } = await signUp.json();
  assert.ok(idToken && localId);

  const url = "https://example.com/";
  const metadata = { url, title: "Example Domain", snippet: "An example page", imageUrl: "https://example.com/icon.png", siteName: "Example" };
  const hash = createHash("sha256").update(url).digest("hex");
  await db.collection("UrlMetadata").doc(hash).set({ metadata, fetchedAt: new Date() });
  for (const data of [{ url }, url]) {
    const result = await call("getUrlMetadata", data, idToken);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.result, metadata);
  }
  for (const token of [undefined, "invalid-token"]) {
    const denied = await call("getUrlMetadata", { url }, token);
    assert.equal(denied.status, 401);
    assert.equal(denied.body.error.status, "UNAUTHENTICATED");
  }
  assert.equal((await call("getUrlMetadata", { url: "" }, idToken)).body.error.status, "INVALID_ARGUMENT");
  for (const url of ["http://127.0.0.1/", "http://169.254.169.254/computeMetadata/v1/", "data:text/html,blocked"]) {
    assert.equal((await call("getUrlMetadata", { url }, idToken)).body.error.status, "NOT_FOUND");
  }

  const id = "api-smoke";
  const ref = db.collection("DataGroups").doc(id);
  const mirror = db.collection("Domains").doc(id);
  await ref.set({ id, title: "API <smoke>", ownerId: localId, items: { one: { id: "one", link: url, title: "Keep my title", snippet: "", imageUrl: "", order: 0 } } });
  await waitFor(async () => (await mirror.get()).data()?.title === "API <smoke>");
  const filled = await call("populateUrlMetadata", { groupId: id }, idToken);
  assert.equal(filled.status, 200);
  assert.equal(filled.body.result.updated, 1);
  assert.equal(filled.body.result.items.one.title, "Keep my title");
  assert.equal(filled.body.result.items.one.snippet, metadata.snippet);
  assert.equal((await ref.get()).data().items.one.imageUrl, metadata.imageUrl);
  assert.equal((await call("populateUrlMetadata", `DataGroups/${id}`, idToken)).body.result.updated, 0);
  await ref.update({ ownerId: "another-user" });
  assert.equal((await call("populateUrlMetadata", { groupId: id }, idToken)).body.error.status, "PERMISSION_DENIED");
  assert.equal((await call("populateUrlMetadata", { groupId: "../private" }, idToken)).body.error.status, "INVALID_ARGUMENT");

  const page = await fetch(`${base}/renderCollection/${id}`);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.ok(html.includes("<title>API &lt;smoke&gt;</title>"));
  assert.ok(html.includes(`https://goli.st/${id}`));
  const shell = readFileSync(new URL("../frontend/dist/index.html", import.meta.url), "utf8");
  assert.equal(readFileSync(new URL("../functions/shell.html", import.meta.url), "utf8"), shell);
  for (const [asset] of shell.matchAll(/\/assets\/[^"']+/g)) assert.ok(html.includes(asset));
  await ref.update({ title: "Renamed API smoke" });
  await waitFor(async () => (await mirror.get()).data()?.title === "Renamed API smoke");
  await ref.delete();
  await waitFor(async () => !(await mirror.get()).exists);
  console.log("API smoke passed: authenticated and legacy callables, auth rejection, private URL blocking, metadata persistence, ownership, SSR/assets, and mirror create/update/delete.");
} finally {
  await db.terminate();
  await deleteApp(app);
}
