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
import reducer, { sortItemIds } from "./reducer";
import { detailChanges, draftUpdates, isDraftDirty } from "./drafts";

const initial = reducer(undefined, { type: "@@INIT" });

function snapshot(groupId, items, extra = {}) {
  return {
    type: "collections/snapshot",
    groupId,
    data: { title: "List", ownerId: "alice", items, ...extra }
  };
}

describe("default case", () => {
  // The previous reducer returned `{ ...state }` here, producing a new object
  // for every action in the app and defeating every useSelector memoisation.
  it("returns the identical state object for unknown actions", () => {
    const next = reducer(initial, { type: "something/unrelated" });
    expect(next).toBe(initial);
  });
});

describe("sortItemIds", () => {
  it("orders by the explicit order field", () => {
    const items = {
      c: { id: "c", order: 2 },
      a: { id: "a", order: 0 },
      b: { id: "b", order: 1 }
    };
    expect(sortItemIds(items)).toEqual(["a", "b", "c"]);
  });

  // Collections created before ordering existed have no `order`. The old code
  // sorted by UUID, so the order looked random and changed as items were added.
  it("falls back to title for legacy items with no order", () => {
    const items = {
      z: { id: "z", title: "Banana" },
      y: { id: "y", title: "Apple" }
    };
    expect(sortItemIds(items)).toEqual(["y", "z"]);
  });

  it("puts ordered items ahead of unordered ones", () => {
    const items = {
      legacy: { id: "legacy", title: "Zebra" },
      ordered: { id: "ordered", order: 5 }
    };
    expect(sortItemIds(items)).toEqual(["ordered", "legacy"]);
  });

  it("handles empty and missing input", () => {
    expect(sortItemIds({})).toEqual([]);
    expect(sortItemIds(undefined)).toEqual([]);
  });
});

describe("snapshot", () => {
  it("stores the group, its items, and marks it ready", () => {
    const state = reducer(
      initial,
      snapshot("list-1", { a: { id: "a", order: 0, link: "https://a.com" } })
    );

    expect(state.groupStatus["list-1"]).toBe("ready");
    expect(state.groups["list-1"].itemIds).toEqual(["a"]);
    expect(state.items.a.link).toBe("https://a.com");
  });

  // "Loaded but empty" and "still loading" have to be distinguishable, or an
  // empty collection shows a loading spinner forever — the old behaviour.
  it("marks an empty collection ready rather than leaving it loading", () => {
    const state = reducer(initial, snapshot("empty-1", {}));
    expect(state.groupStatus["empty-1"]).toBe("ready");
    expect(state.groups["empty-1"].itemIds).toEqual([]);
  });

  it("tolerates a document with no items field", () => {
    const state = reducer(initial, {
      type: "collections/snapshot",
      groupId: "bare",
      data: { title: "Bare", ownerId: "alice" }
    });
    expect(state.groupStatus.bare).toBe("ready");
    expect(state.groups.bare.itemIds).toEqual([]);
  });
});

describe("removed", () => {
  it("drops the group and its items", () => {
    const loaded = reducer(
      initial,
      snapshot("list-1", { a: { id: "a", order: 0 } })
    );
    const state = reducer(loaded, {
      type: "collections/removed",
      groupId: "list-1"
    });

    expect(state.groups["list-1"]).toBeUndefined();
    expect(state.items.a).toBeUndefined();
    expect(state.groupStatus["list-1"]).toBeUndefined();
  });
});

describe("edit-mode drafts", () => {
  const REMOVED = "<removed>";
  const loaded = reducer(
    initial,
    snapshot("list-1", {
      a: { id: "a", order: 0, link: "https://a.com", title: "A", snippet: "", imageUrl: "" },
      b: { id: "b", order: 1, link: "https://b.com", title: "B", snippet: "Bee", imageUrl: "" }
    })
  );
  const act = (state, type, extra = {}) =>
    reducer(state, { type: `collections/${type}`, groupId: "list-1", ...extra });
  const editing = act(loaded, "draftStart");

  it("edits a copy and leaves the saved collection alone", () => {
    let state = act(editing, "draftRename", { title: "Renamed" });
    state = act(state, "draftReorder", { itemIds: ["b", "a"] });
    state = act(state, "draftUpdateItem", { itemId: "a", data: { title: "A2" } });
    state = act(state, "draftRemoveItem", { itemId: "b" });

    expect(state.drafts["list-1"].title).toBe("Renamed");
    expect(state.drafts["list-1"].itemIds).toEqual(["a"]);
    expect(state.drafts["list-1"].items.a.title).toBe("A2");
    // What visitors see does not change until the save lands.
    expect(state.groups["list-1"]).toBe(loaded.groups["list-1"]);
    expect(state.items).toBe(loaded.items);
  });

  it("describes nothing to save for an untouched draft", () => {
    expect(draftUpdates(editing.drafts["list-1"], REMOVED)).toEqual({});
    expect(isDraftDirty(editing.drafts["list-1"])).toBe(false);
  });

  // A reorder should not rewrite every description, and a collaborator's
  // edit to a field the owner never touched must survive the save.
  it("saves only the fields that changed, as field paths", () => {
    let state = act(editing, "draftRename", { title: "Renamed" });
    state = act(state, "draftUpdateItem", { itemId: "a", data: { snippet: "Aye" } });
    state = act(state, "draftRemoveItem", { itemId: "b" });

    expect(draftUpdates(state.drafts["list-1"], REMOVED)).toEqual({
      title: "Renamed",
      "items.a.snippet": "Aye",
      "items.b": REMOVED
    });
  });

  it("rewrites order only when the sequence changed", () => {
    const reordered = act(editing, "draftReorder", { itemIds: ["b", "a"] });
    expect(draftUpdates(reordered.drafts["list-1"], REMOVED)).toEqual({
      "items.b.order": 0,
      "items.a.order": 1
    });

    // Stored orders with a gap (left by an earlier delete) are not a change.
    const gapped = act(
      reducer(
        initial,
        snapshot("list-1", {
          a: { id: "a", order: 0, link: "https://a.com" },
          c: { id: "c", order: 5, link: "https://c.com" }
        })
      ),
      "draftStart"
    );
    expect(draftUpdates(gapped.drafts["list-1"], REMOVED)).toEqual({});
  });

  it("writes an added link whole, at the end", () => {
    const item = { id: "n", link: "https://n.com", title: "", snippet: "", imageUrl: "" };
    const state = act(editing, "draftAddItem", { item });
    expect(draftUpdates(state.drafts["list-1"], REMOVED)).toEqual({
      "items.n": { ...item, order: 2 }
    });
  });

  it("applies exactly the details the owner accepted, replacing when asked", () => {
    const state = act(editing, "draftApplySuggestions", {
      accepted: {
        a: { title: "From the page", imageUrl: "https://a.com/og.png" },
        b: { snippet: "Newer" }
      }
    });
    const { a, b } = state.drafts["list-1"].items;
    expect(a.title).toBe("From the page");
    expect(a.imageUrl).toBe("https://a.com/og.png");
    expect(a.snippet).toBe("");
    expect(b.snippet).toBe("Newer");
    expect(b.title).toBe("B");
  });

  // A link added in edit mode fetches its own preview; that arrives into
  // whatever the owner has typed in the meantime and must not overwrite it.
  it("fills a new link's preview without overwriting what was typed", () => {
    const item = { id: "n", link: "https://n.com", title: "Mine", snippet: "", imageUrl: "" };
    let state = act(editing, "draftAddItem", { item });
    state = act(state, "draftFillItem", {
      itemId: "n",
      metadata: { title: "Theirs", snippet: "From the page" }
    });
    expect(state.drafts["list-1"].items.n).toMatchObject({
      title: "Mine",
      snippet: "From the page"
    });
  });

  it("drops the draft and its suggestions on discard, save or delete", () => {
    const withSuggestions = act(editing, "suggestionsStarted", { total: 1 });
    for (const type of ["draftDiscard", "draftSaved", "removed"]) {
      const state = act(withSuggestions, type);
      expect(state.drafts["list-1"]).toBeUndefined();
      expect(state.suggestions["list-1"]).toBeUndefined();
    }
  });

  it("collects suggestions as each link is checked", () => {
    let state = act(editing, "suggestionsStarted", { total: 2 });
    state = act(state, "suggestionsResult", { itemId: "a", found: { snippet: "S" } });
    state = act(state, "suggestionsResult", { itemId: "b", found: {} });
    state = act(state, "suggestionsFinished");

    expect(state.suggestions["list-1"]).toEqual({
      status: "ready",
      total: 2,
      checked: 2,
      found: { a: { snippet: "S" } }
    });
  });

  it("ignores draft actions for a collection that is not being edited", () => {
    const state = act(loaded, "draftRename", { title: "Nope" });
    expect(state).toBe(loaded);
  });
});

describe("create lifecycle", () => {
  it("records the new id only when the create succeeded", () => {
    const started = reducer(initial, {
      type: "collections/createStarted",
      groupId: "new-list"
    });
    expect(started.creating["new-list"]).toBe(true);

    const failed = reducer(started, {
      type: "collections/createFinished",
      groupId: "new-list",
      ok: false
    });
    expect(failed.creating["new-list"]).toBeUndefined();
    expect(failed.lastCreatedId).toBeNull();

    const ok = reducer(started, {
      type: "collections/createFinished",
      groupId: "new-list",
      ok: true
    });
    expect(ok.lastCreatedId).toBe("new-list");

    const consumed = reducer(ok, { type: "collections/consumeCreated" });
    expect(consumed.lastCreatedId).toBeNull();
  });
});

describe("detailChanges", () => {
  const item = { title: "Mine", snippet: "", imageUrl: "https://x.com/old.png" };

  it("adds what is missing and replaces what differs", () => {
    expect(
      detailChanges(item, {
        title: "The page's title",
        snippet: "About it",
        imageUrl: "https://x.com/new.png"
      })
    ).toEqual([
      { field: "title", kind: "replace", from: "Mine", to: "The page's title" },
      { field: "snippet", kind: "add", from: "", to: "About it" },
      { field: "imageUrl", kind: "replace", from: "https://x.com/old.png", to: "https://x.com/new.png" }
    ]);
  });

  it("ignores details the page repeats unchanged or leaves empty", () => {
    expect(detailChanges(item, { title: "  Mine  ", imageUrl: "" })).toEqual([]);
  });

  it("measures a replacement at its stored length", () => {
    const long = "x".repeat(260);
    const clamped = { title: "x".repeat(200) };
    expect(detailChanges(clamped, { title: long })).toEqual([]);
  });
});
