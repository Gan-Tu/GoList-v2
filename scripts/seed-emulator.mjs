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

// Seeds the local emulator with a few collections so the app has something to
// render during development. Writes go in with security rules disabled, the
// same way the Admin SDK would in production.
//
// Usage: npm run seed  (with the emulator suite already running)

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";

const PROJECT_ID = "golist-v2";
const DEMO_OWNER = "PUBLIC";

function item(id, order, link, title, snippet) {
  return { id, order, link, title, snippet, imageUrl: "" };
}

const COLLECTIONS = {
  "demo-list": {
    id: "demo-list",
    title: "Simple Demo",
    ownerId: DEMO_OWNER,
    items: {
      "demo-1": item(
        "demo-1",
        0,
        "https://example.com",
        "Example Domain",
        "This domain is for use in illustrative examples in documents."
      ),
      "demo-2": item(
        "demo-2",
        1,
        "https://developer.mozilla.org",
        "MDN Web Docs",
        "Resources for developers, by developers."
      ),
      "demo-3": item(
        "demo-3",
        2,
        "https://firebase.google.com/docs/firestore",
        "Cloud Firestore",
        "Flexible, scalable NoSQL cloud database."
      )
    }
  },
  "web-mobile": {
    id: "web-mobile",
    title: "Web & Mobile Industry",
    ownerId: DEMO_OWNER,
    items: {
      "wm-1": item(
        "wm-1",
        0,
        "https://web.dev",
        "web.dev",
        "Guidance for building modern web experiences."
      ),
      "wm-2": item("wm-2", 1, "https://react.dev", "React", "The library for web and native user interfaces."),
      "wm-3": item("wm-3", 2, "https://vite.dev", "Vite", "The build tool for the web."),
      "wm-4": item("wm-4", 3, "https://tailwindcss.com", "Tailwind CSS", "A utility-first CSS framework."),
      "wm-5": item("wm-5", 4, "https://redux.js.org", "Redux", "A predictable state container for JS apps.")
    }
  },
  // Deliberately empty, to exercise the empty state that used to render an
  // endless loading spinner.
  "empty-list": {
    id: "empty-list",
    title: "Nothing here yet",
    ownerId: DEMO_OWNER,
    items: {}
  }
};

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { host: "127.0.0.1", port: 8080 }
});

await testEnv.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore();
  for (const [id, data] of Object.entries(COLLECTIONS)) {
    await setDoc(doc(db, "DataGroups", id), data);
    // In production a trigger maintains this mirror; the emulator seed writes
    // it directly so "My Lists" has something to show.
    await setDoc(doc(db, "Domains", id), {
      title: data.title,
      ownerId: data.ownerId
    });
    console.log(`[seed] DataGroups/${id} — ${Object.keys(data.items).length} items`);
  }
});

await testEnv.cleanup();
console.log("[seed] Done.");
process.exit(0);
