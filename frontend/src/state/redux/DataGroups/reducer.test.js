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

describe("reorderOptimistic", () => {
  it("reorders ids and rewrites the order field without mutating state", () => {
    const loaded = reducer(
      initial,
      snapshot("list-1", {
        a: { id: "a", order: 0 },
        b: { id: "b", order: 1 }
      })
    );
    const before = loaded.items.a;

    const state = reducer(loaded, {
      type: "collections/reorderOptimistic",
      groupId: "list-1",
      itemIds: ["b", "a"]
    });

    expect(state.groups["list-1"].itemIds).toEqual(["b", "a"]);
    expect(state.items.a.order).toBe(1);
    expect(state.items.b.order).toBe(0);
    // The original object must be untouched — the old reducer mutated the
    // group it had just copied out of the previous state.
    expect(before.order).toBe(0);
  });

  it("ignores a reorder for a group that is not loaded", () => {
    const state = reducer(initial, {
      type: "collections/reorderOptimistic",
      groupId: "missing",
      itemIds: ["a"]
    });
    expect(state).toBe(initial);
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
