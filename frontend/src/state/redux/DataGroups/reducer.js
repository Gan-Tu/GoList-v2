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

// State is plain objects rather than Maps so it stays serializable — Redux
// DevTools time-travel and the store's serializableCheck both depend on that.

const initialState = {
  // groupId -> { id, title, ownerId, itemIds: [] }
  groups: {},
  // itemId -> { id, link, title, snippet, imageUrl, order }
  items: {},
  // groupId -> "loading" | "ready" | "notFound" | "error"
  groupStatus: {},
  // groupId -> boolean, true while a create is in flight
  creating: {},
  // itemId -> boolean, true while a save is in flight
  savingItems: {},
  // Set when a create succeeds so the form can navigate to the new collection.
  // Sagas have no router access, so the intent is parked here and the
  // component consumes it — rather than the old fixed 1-second setTimeout.
  lastCreatedId: null
};

/**
 * Orders items by their explicit `order` field.
 *
 * Lists created before ordering existed have no `order`, and the previous code
 * sorted by UUID — which is to say, randomly, and differently every time an
 * item was added. Those fall back to a stable alphabetical order by title.
 */
export function sortItemIds(items) {
  return Object.values(items || {})
    .slice()
    .sort((a, b) => {
      const aOrder = Number.isFinite(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;

      const byTitle = String(a?.title || "").localeCompare(String(b?.title || ""));
      if (byTitle !== 0) return byTitle;

      return String(a?.id || "").localeCompare(String(b?.id || ""));
    })
    .map((item) => item.id);
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "collections/loading": {
      return {
        ...state,
        groupStatus: { ...state.groupStatus, [action.groupId]: "loading" }
      };
    }

    case "collections/snapshot": {
      const { groupId, data } = action;
      const itemsById = data.items || {};

      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: {
            id: groupId,
            title: data.title || "",
            ownerId: data.ownerId || null,
            itemIds: sortItemIds(itemsById)
          }
        },
        items: { ...state.items, ...itemsById },
        groupStatus: { ...state.groupStatus, [groupId]: "ready" }
      };
    }

    case "collections/notFound": {
      return {
        ...state,
        groupStatus: { ...state.groupStatus, [action.groupId]: "notFound" }
      };
    }

    case "collections/error": {
      return {
        ...state,
        groupStatus: { ...state.groupStatus, [action.groupId]: "error" }
      };
    }

    case "collections/removed": {
      const groups = { ...state.groups };
      const groupStatus = { ...state.groupStatus };
      const items = { ...state.items };

      for (const itemId of groups[action.groupId]?.itemIds || []) {
        delete items[itemId];
      }
      delete groups[action.groupId];
      delete groupStatus[action.groupId];

      return { ...state, groups, items, groupStatus };
    }

    case "collections/createStarted": {
      return {
        ...state,
        creating: { ...state.creating, [action.groupId]: true }
      };
    }

    case "collections/createFinished": {
      const creating = { ...state.creating };
      delete creating[action.groupId];
      return {
        ...state,
        creating,
        lastCreatedId: action.ok ? action.groupId : state.lastCreatedId
      };
    }

    case "collections/consumeCreated": {
      return { ...state, lastCreatedId: null };
    }

    case "collections/itemSaving": {
      const savingItems = { ...state.savingItems };
      if (action.saving) {
        savingItems[action.itemId] = true;
      } else {
        delete savingItems[action.itemId];
      }
      return { ...state, savingItems };
    }

    // Applied immediately on drag so the list does not snap back while the
    // write is in flight; the next snapshot confirms it.
    case "collections/reorderOptimistic": {
      const group = state.groups[action.groupId];
      if (!group) return state;

      const items = { ...state.items };
      action.itemIds.forEach((itemId, index) => {
        if (items[itemId]) items[itemId] = { ...items[itemId], order: index };
      });

      return {
        ...state,
        items,
        groups: {
          ...state.groups,
          [action.groupId]: { ...group, itemIds: action.itemIds }
        }
      };
    }

    // Returning `state` — not a fresh object — is what lets useSelector skip
    // re-rendering. The previous `{ ...state }` default made every subscriber
    // re-run on every dispatched action in the app.
    default:
      return state;
  }
}
