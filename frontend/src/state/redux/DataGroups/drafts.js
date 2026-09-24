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

// Edit mode works on a draft: a copy of the collection that the owner
// reshapes — reorder, rename, edit, remove, add — and then saves in one write
// or throws away. Everything here is pure, so the reducer and the save saga
// share it and it can be tested without Firebase.

import { fixUrl } from "../../../components/Utilities/Helpers";

const ITEM_FIELDS = ["link", "title", "snippet", "imageUrl"];

// The details a link can be missing, and how long each may be — the same
// limits the edit form counts against.
export const DETAIL_LIMITS = { title: 200, snippet: 500, imageUrl: 2048 };
const DETAIL_FIELDS = Object.keys(DETAIL_LIMITS);

const isBlank = (value) => !String(value ?? "").trim();

/**
 * A draft of the collection as it stands. `base` keeps that starting point so
 * a save can write only what changed, rather than overwriting fields someone
 * else edited in the meantime.
 */
export function createDraft(group, items) {
  const draftItems = {};
  for (const id of group.itemIds) {
    if (items[id]) draftItems[id] = items[id];
  }
  const snapshot = {
    title: group.title,
    itemIds: group.itemIds.filter((id) => draftItems[id]),
    items: draftItems
  };
  return { base: snapshot, ...snapshot };
}

/** Which of title, description and image a link has no value for. */
export function missingDetails(item) {
  return DETAIL_FIELDS.filter((field) => isBlank(item?.[field]));
}

/**
 * Fills in only the details a link is missing. Anything already there —
 * including something the owner typed after the lookup started — is kept.
 */
export function fillMissing(item, found) {
  if (!item || !found) return item;
  let next = item;
  for (const field of DETAIL_FIELDS) {
    const value = String(found[field] ?? "").trim();
    if (value && isBlank(item[field])) {
      next = { ...next, [field]: value.slice(0, DETAIL_LIMITS[field]) };
    }
  }
  return next;
}

/** A draft item with only the editable fields taken from `data`. */
export function applyItemEdit(item, data) {
  const next = { ...item };
  for (const field of ITEM_FIELDS) {
    if (data?.[field] !== undefined) next[field] = String(data[field] ?? "");
  }
  next.link = fixUrl(next.link);
  return next;
}

/**
 * The Firestore update that turns the draft's starting point into the draft,
 * as field paths: `items.<id>.title` rather than whole items, so a reorder
 * does not rewrite every description and a collaborator's edit to a field
 * the owner never touched survives the save. `removed` is the value that
 * deletes a field (the saga passes Firestore's deleteField()).
 */
export function draftUpdates(draft, removed) {
  if (!draft) return {};
  const { base } = draft;
  const updates = {};

  const title = String(draft.title ?? "").trim();
  if (title !== String(base.title ?? "").trim()) updates.title = title;

  for (const id of base.itemIds) {
    if (!draft.items[id]) updates[`items.${id}`] = removed;
  }

  // Order is only rewritten when the sequence actually changed. Lists whose
  // stored order has gaps (from deletes) would otherwise look edited the
  // moment editing started.
  const kept = base.itemIds.filter((id) => draft.items[id]);
  const reordered = kept.join("\n") !== draft.itemIds.filter((id) => base.items[id]).join("\n");
  const added = draft.itemIds.some((id) => !base.items[id]);
  const renumber = reordered || added;

  draft.itemIds.forEach((id, index) => {
    const item = draft.items[id];
    const before = base.items[id];
    if (!before) {
      updates[`items.${id}`] = { ...item, id, order: index };
      return;
    }
    for (const field of ITEM_FIELDS) {
      const value = item[field] ?? "";
      if (value !== (before[field] ?? "")) updates[`items.${id}.${field}`] = value;
    }
    if (renumber && before.order !== index) {
      updates[`items.${id}.order`] = index;
    }
  });

  return updates;
}

/** True once the draft differs from where it started. */
export function isDraftDirty(draft) {
  return Object.keys(draftUpdates(draft, null)).length > 0;
}
