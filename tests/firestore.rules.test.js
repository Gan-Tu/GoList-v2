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

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it
} from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";

const here = dirname(fileURLToPath(import.meta.url));
const rules = readFileSync(resolve(here, "../firestore.rules"), "utf8");

const ALICE = "alice-uid";
const BOB = "bob-uid";
const GROUP = "my-list";

let testEnv;

/** A minimal valid DataGroups document owned by `ownerId`. */
function group(ownerId, overrides = {}) {
  return {
    id: GROUP,
    title: "My List",
    ownerId,
    items: {
      "item-1": {
        id: "item-1",
        link: "https://example.com",
        title: "Example",
        snippet: "",
        imageUrl: "",
        order: 0
      }
    },
    ...overrides
  };
}

/** Seeds a document straight past the rules, the way a trigger would. */
async function seed(path, data) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

beforeAll(async () => {
  const [host, port] = (
    process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080"
  ).split(":");
  testEnv = await initializeTestEnvironment({
    projectId: "golist-v2-test",
    firestore: { rules, host, port: Number(port) }
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("DataGroups — reads", () => {
  it("lets anyone read a list by id, signed in or not", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, `DataGroups/${GROUP}`)));
  });

  it("refuses to enumerate every list in the project", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(anon, "DataGroups")));
  });
});

describe("DataGroups — creation", () => {
  it("rejects creation by an unauthenticated caller", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon, `DataGroups/${GROUP}`), group(ALICE)));
  });

  it("allows a signed-in caller to claim an unused short url", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(
      setDoc(doc(alice, `DataGroups/${GROUP}`), group(ALICE))
    );
  });

  it("rejects a create that attributes the list to someone else", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(alice, `DataGroups/${GROUP}`), group(BOB)));
  });

  // The headline fix: setDoc() on an existing id used to silently destroy
  // whatever was there. `allow create` makes short urls claim-once.
  it("refuses to overwrite an existing list (short-url squatting)", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(doc(bob, `DataGroups/${GROUP}`), group(BOB)));
  });

  it("rejects ids that are too short or use a disallowed charset", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, "DataGroups/abc"), group(ALICE, { id: "abc" }))
    );
    await assertFails(
      setDoc(
        doc(alice, "DataGroups/has spaces"),
        group(ALICE, { id: "has spaces" })
      )
    );
  });

  it("rejects a document whose id field disagrees with its path", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, `DataGroups/${GROUP}`), group(ALICE, { id: "other" }))
    );
  });

  it("rejects oversized payloads", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(
        doc(alice, `DataGroups/${GROUP}`),
        group(ALICE, { title: "x".repeat(201) })
      )
    );

    const tooManyItems = {};
    for (let i = 0; i < 51; i += 1) {
      tooManyItems[`item-${i}`] = { id: `item-${i}`, link: "https://a.com" };
    }
    await assertFails(
      setDoc(
        doc(alice, `DataGroups/${GROUP}`),
        group(ALICE, { items: tooManyItems })
      )
    );
  });

  it("rejects a document missing required fields", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, `DataGroups/${GROUP}`), { id: GROUP, title: "No owner" })
    );
  });
});

describe("DataGroups — updates", () => {
  it("lets the owner rename their list", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(
      updateDoc(doc(alice, `DataGroups/${GROUP}`), { title: "Renamed" })
    );
  });

  it("lets the owner add and remove items", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(
      updateDoc(doc(alice, `DataGroups/${GROUP}`), {
        "items.item-2": { id: "item-2", link: "https://b.com", order: 1 }
      })
    );
  });

  it("stops a stranger from editing someone else's list", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(
      updateDoc(doc(bob, `DataGroups/${GROUP}`), { title: "Hijacked" })
    );
  });

  it("stops an unauthenticated caller from editing", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      updateDoc(doc(anon, `DataGroups/${GROUP}`), { title: "Hijacked" })
    );
  });

  // Ownership takeover: without preservesIdentity() the owner could be
  // rewritten by anyone who already had write access (e.g. on a PUBLIC list).
  it("refuses to let ownerId be reassigned", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      updateDoc(doc(alice, `DataGroups/${GROUP}`), { ownerId: BOB })
    );
  });

  it("refuses to let a PUBLIC list be claimed as private", async () => {
    await seed(`DataGroups/${GROUP}`, group("PUBLIC"));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(
      updateDoc(doc(bob, `DataGroups/${GROUP}`), { ownerId: BOB })
    );
  });
});

describe("DataGroups — deletion", () => {
  it("lets the owner delete their list", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(deleteDoc(doc(alice, `DataGroups/${GROUP}`)));
  });

  it("stops a stranger from deleting a list", async () => {
    await seed(`DataGroups/${GROUP}`, group(ALICE));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(deleteDoc(doc(bob, `DataGroups/${GROUP}`)));
  });

  // Demo lists are collaboratively editable, which would otherwise mean
  // collaboratively destroyable.
  it("stops anyone from deleting a shared PUBLIC demo list", async () => {
    await seed(`DataGroups/${GROUP}`, group("PUBLIC"));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(deleteDoc(doc(bob, `DataGroups/${GROUP}`)));
  });
});

describe("DataGroups — PUBLIC demo lists", () => {
  it("lets any signed-in user edit a PUBLIC list", async () => {
    await seed(`DataGroups/${GROUP}`, group("PUBLIC"));
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertSucceeds(
      updateDoc(doc(bob, `DataGroups/${GROUP}`), { title: "Community edit" })
    );
  });

  it("still requires sign-in to edit a PUBLIC list", async () => {
    await seed(`DataGroups/${GROUP}`, group("PUBLIC"));
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      updateDoc(doc(anon, `DataGroups/${GROUP}`), { title: "Drive-by" })
    );
  });
});

describe("Domains", () => {
  it("serves the scoped 'my lists' query", async () => {
    await seed(`Domains/${GROUP}`, { title: "My List", ownerId: ALICE });
    await seed("Domains/demo-list", { title: "Demo", ownerId: "PUBLIC" });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(
      getDocs(
        query(
          collection(alice, "Domains"),
          where("ownerId", "in", [ALICE, "PUBLIC"])
        )
      )
    );
  });

  it("refuses an unscoped listing of every domain", async () => {
    await seed(`Domains/${GROUP}`, { title: "My List", ownerId: ALICE });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(getDocs(collection(alice, "Domains")));
  });

  it("refuses to reveal another user's domains", async () => {
    await seed(`Domains/${GROUP}`, { title: "My List", ownerId: ALICE });
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(getDoc(doc(bob, `Domains/${GROUP}`)));
  });

  // The mirror is trigger-maintained; a client write would desync it from
  // DataGroups and could forge entries into another user's list view.
  it("is never writable from a client", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, `Domains/${GROUP}`), {
        title: "Forged",
        ownerId: ALICE
      })
    );
  });
});

describe("collections outside the schema", () => {
  it("denies reads and writes to anything not explicitly modelled", async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(getDoc(doc(alice, "Secrets/anything")));
    await assertFails(setDoc(doc(alice, "Secrets/anything"), { a: 1 }));
  });
});
