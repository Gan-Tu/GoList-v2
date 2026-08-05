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

import { useSelector } from "react-redux";

// useSelector compares results by reference. Returning a fresh `[]` from a
// selector — as `... || []` does — looks like a new value on every store read
// and re-renders the component forever. One shared constant fixes it.
const EMPTY_ARRAY = Object.freeze([]);

export function useGroup(groupId) {
  return useSelector((store) => store.collections.groups[groupId]);
}

export function useGroupStatus(groupId) {
  return useSelector((store) => store.collections.groupStatus[groupId]);
}

export function useIsCreating(groupId) {
  return useSelector((store) => Boolean(store.collections.creating[groupId]));
}

export function useLastCreatedId() {
  return useSelector((store) => store.collections.lastCreatedId);
}

export function useItemIds(groupId) {
  return useSelector(
    (store) => store.collections.groups[groupId]?.itemIds || EMPTY_ARRAY
  );
}

export function useItemData(itemId) {
  return useSelector((store) => store.collections.items[itemId]);
}

export function useItemLink(itemId) {
  return useSelector((store) => store.collections.items[itemId]?.link);
}

export function useItemIsSaving(itemId) {
  return useSelector((store) => Boolean(store.collections.savingItems[itemId]));
}

/**
 * Whether the signed-in user may edit this collection.
 *
 * This only drives what the UI offers — Firestore rules are what actually
 * enforce it. Hiding a button is a courtesy, not a control.
 */
export function useCanEdit(groupId) {
  return useSelector((store) => {
    const uid = store.session.user?.uid;
    const ownerId = store.collections.groups[groupId]?.ownerId;
    if (!ownerId) return false;
    return ownerId === "PUBLIC" || (Boolean(uid) && ownerId === uid);
  });
}

export function useMyCollections() {
  return useSelector((store) => store.session.domains || EMPTY_ARRAY);
}

export function useMyCollectionsStatus() {
  return useSelector((store) => store.session.domainsStatus);
}
