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

import {
  applyDetails,
  applyItemEdit,
  createDraft,
  fillMissing
} from "./drafts";

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
  lastCreatedId: null,
  // groupId -> the edit-mode draft (see drafts.js). Its presence is what puts
  // a collection in edit mode.
  drafts: {},
  // groupId -> boolean, true while a draft's save is in flight
  savingDrafts: {},
  // groupId -> { status: "loading" | "ready", total, checked,
  //              found: { itemId: { title?, snippet?, imageUrl? } } }
  // Details looked up for links that are missing some, awaiting review.
  suggestions: {}
};

/** Applies `update` to a group's draft; a no-op when there is none. */
function withDraft(state, groupId, update) {
  const draft = state.drafts?.[groupId];
  if (!draft) return state;
  return { ...state, drafts: { ...state.drafts, [groupId]: update(draft) } };
}

function without(map, key) {
  if (!map || !(key in map)) return map || {};
  const next = { ...map };
  delete next[key];
  return next;
}

/** Ends an edit session: the draft, its save flag and any suggestions go. */
function endDraft(state, groupId) {
  return {
    ...state,
    drafts: without(state.drafts, groupId),
    savingDrafts: without(state.savingDrafts, groupId),
    suggestions: without(state.suggestions, groupId)
  };
}

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

      // A deleted collection has nothing left to edit.
      return endDraft({ ...state, groups, items, groupStatus }, action.groupId);
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

    // ---- edit-mode drafts ----------------------------------------------------

    case "collections/draftStart": {
      const group = state.groups[action.groupId];
      if (!group || state.drafts?.[action.groupId]) return state;
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.groupId]: createDraft(group, state.items)
        }
      };
    }

    case "collections/draftRename": {
      return withDraft(state, action.groupId, (draft) => ({
        ...draft,
        title: String(action.title ?? "").trim() || draft.title
      }));
    }

    case "collections/draftReorder": {
      return withDraft(state, action.groupId, (draft) => {
        // Only a permutation of what is already there is a reorder.
        const same =
          action.itemIds.length === draft.itemIds.length &&
          action.itemIds.every((id) => draft.items[id]);
        return same ? { ...draft, itemIds: action.itemIds } : draft;
      });
    }

    case "collections/draftUpdateItem": {
      return withDraft(state, action.groupId, (draft) => {
        const item = draft.items[action.itemId];
        if (!item) return draft;
        return {
          ...draft,
          items: { ...draft.items, [action.itemId]: applyItemEdit(item, action.data) }
        };
      });
    }

    case "collections/draftRemoveItem": {
      return withDraft(state, action.groupId, (draft) => ({
        ...draft,
        itemIds: draft.itemIds.filter((id) => id !== action.itemId),
        items: without(draft.items, action.itemId)
      }));
    }

    case "collections/draftAddItem": {
      return withDraft(state, action.groupId, (draft) => {
        if (draft.items[action.item.id]) return draft;
        return {
          ...draft,
          itemIds: [...draft.itemIds, action.item.id],
          items: { ...draft.items, [action.item.id]: action.item }
        };
      });
    }

    // A just-added link's preview arriving. Only empty fields are filled, so
    // anything the owner typed in the meantime wins.
    case "collections/draftFillItem": {
      return withDraft(state, action.groupId, (draft) => {
        const item = draft.items[action.itemId];
        if (!item) return draft;
        return {
          ...draft,
          items: { ...draft.items, [action.itemId]: fillMissing(item, action.metadata) }
        };
      });
    }

    // Exactly the details the owner ticked in review — additions and
    // replacements alike; anything unticked was left out of `accepted`.
    case "collections/draftApplySuggestions": {
      return withDraft(state, action.groupId, (draft) => {
        const items = { ...draft.items };
        for (const [itemId, fields] of Object.entries(action.accepted || {})) {
          if (items[itemId]) items[itemId] = applyDetails(items[itemId], fields);
        }
        return { ...draft, items };
      });
    }

    case "collections/draftSaving": {
      const savingDrafts = { ...state.savingDrafts };
      if (action.saving) {
        savingDrafts[action.groupId] = true;
      } else {
        delete savingDrafts[action.groupId];
      }
      return { ...state, savingDrafts };
    }

    case "collections/draftDiscard":
    case "collections/draftSaved": {
      return endDraft(state, action.groupId);
    }

    // ---- suggested details -------------------------------------------------

    case "collections/suggestionsStarted": {
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.groupId]: {
            status: "loading",
            total: action.total,
            checked: 0,
            found: {}
          }
        }
      };
    }

    case "collections/suggestionsResult": {
      const current = state.suggestions?.[action.groupId];
      if (!current) return state;
      const hasFound = action.found && Object.keys(action.found).length > 0;
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.groupId]: {
            ...current,
            checked: current.checked + 1,
            found: hasFound
              ? { ...current.found, [action.itemId]: action.found }
              : current.found
          }
        }
      };
    }

    case "collections/suggestionsFinished": {
      const current = state.suggestions?.[action.groupId];
      if (!current) return state;
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.groupId]: { ...current, status: "ready" }
        }
      };
    }

    case "collections/suggestionsCleared": {
      return { ...state, suggestions: without(state.suggestions, action.groupId) };
    }

    // Returning `state` — not a fresh object — is what lets useSelector skip
    // re-rendering. The previous `{ ...state }` default made every subscriber
    // re-run on every dispatched action in the app.
    default:
      return state;
  }
}
