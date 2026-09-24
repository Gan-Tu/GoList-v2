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
  all,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
  takeLeading
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as fs from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { db, functions } from "../../../firebase";
import { fixUrl, validateShortUrl } from "../../../components/Utilities/Helpers";
import { ensureSignedIn } from "../Session/index";
import { draftUpdates } from "./drafts";

const COLLECTION = "DataGroups";

/**
 * Turns Firestore's onSnapshot listener into a saga channel.
 *
 * Reads used to be one-shot getDoc calls, so a collection open in two tabs (or
 * edited on a phone while open on a laptop) silently diverged until reload.
 */
function createGroupChannel(groupId) {
  return eventChannel((emit) => {
    const unsubscribe = fs.onSnapshot(
      fs.doc(db, COLLECTION, groupId),
      (snapshot) => {
        emit(
          snapshot.exists()
            ? { kind: "data", data: snapshot.data() }
            : { kind: "missing" }
        );
      },
      (error) => emit({ kind: "error", error })
    );
    return unsubscribe;
  });
}

function* streamGroup(groupId) {
  const channel = yield call(createGroupChannel, groupId);
  try {
    while (true) {
      const event = yield take(channel);
      if (event.kind === "data") {
        yield put({ type: "collections/snapshot", groupId, data: event.data });
      } else if (event.kind === "missing") {
        yield put({ type: "collections/notFound", groupId });
      } else {
        console.error(`Snapshot error for /${groupId}:`, event.error);
        yield put({ type: "collections/error", groupId });
      }
    }
  } finally {
    channel.close();
  }
}

function* subscribeGroup({ groupId }) {
  yield put({ type: "collections/loading", groupId });
  // The listener lives until the view unsubscribes, then the channel's
  // finally-block detaches it. Without this the listener leaked per navigation.
  yield race({
    stream: call(streamGroup, groupId),
    cancelled: take(
      (action) =>
        action.type === "collections/unsubscribe" && action.groupId === groupId
    )
  });
}

function* fetchAccessibleGroups({ uid }) {
  if (!uid) {
    yield put({ type: "session/domainsLoaded", domains: [] });
    return;
  }

  yield put({ type: "session/domainsLoading" });
  try {
    const querySnapshot = yield call(
      fs.getDocs,
      fs.query(
        fs.collection(db, "Domains"),
        fs.where("ownerId", "in", [uid, "PUBLIC"])
      )
    );
    const domains = querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        title: data.title,
        url: `goli.st/${docSnapshot.id}`,
        destination: `/${docSnapshot.id}`,
        ownerId: data.ownerId
      };
    });
    yield put({ type: "session/domainsLoaded", domains });
  } catch (error) {
    console.error("Failed to load your lists:", error);
    yield put({ type: "session/domainsError" });
    toast.error("Could not load your lists.");
  }
}

/**
 * Kicks off server-side metadata backfill without blocking the UI.
 *
 * Creation used to await this, so the user stared at "Auto-populating
 * metadata..." before their list appeared. Now the list is created, the user
 * navigates immediately, and previews stream in over the snapshot listener.
 */
function* backfillMetadata(groupId) {
  try {
    yield call(httpsCallable(functions, "populateUrlMetadata"), { groupId });
  } catch (error) {
    console.error(`Metadata backfill failed for /${groupId}:`, error);
    toast("Some link previews could not be loaded.", { icon: "⚠️" });
  }
}

function* createGroup({ groupId, title, urls }) {
  const validationError = validateShortUrl(groupId);
  if (validationError) {
    toast.error(validationError);
    return;
  }

  // Marked as started before the sign-in round-trip, not after: a first-time
  // visitor has no session yet, and the button otherwise showed no progress
  // at all while an anonymous one was created.
  yield put({ type: "collections/createStarted", groupId });

  const uid = yield call(ensureSignedIn);
  if (!uid) {
    yield put({ type: "collections/createFinished", groupId, ok: false });
    toast.error("Could not start a session. Please try again.");
    return;
  }

  const toastId = toast.loading("Creating your collection...");

  const links = String(urls || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items = {};
  links.forEach((link, index) => {
    const itemId = uuidv4();
    items[itemId] = {
      id: itemId,
      link: fixUrl(link),
      title: "",
      snippet: "",
      imageUrl: "",
      // Preserves the order the user typed them in.
      order: index
    };
  });

  const data = { id: groupId, title: title.trim(), ownerId: uid, items };

  try {
    // A transaction makes claiming a short URL atomic. The previous code called
    // setDoc() unconditionally, so creating a list at an id that already
    // existed destroyed the original.
    yield call(fs.runTransaction, db, async (tx) => {
      const ref = fs.doc(db, COLLECTION, groupId);
      const existing = await tx.get(ref);
      if (existing.exists()) {
        const conflict = new Error("TAKEN");
        conflict.code = "TAKEN";
        throw conflict;
      }
      tx.set(ref, data);
    });
  } catch (error) {
    yield put({ type: "collections/createFinished", groupId, ok: false });
    if (error?.code === "TAKEN") {
      toast.error(`goli.st/${groupId} is already taken. Try another URL.`, {
        id: toastId
      });
    } else {
      console.error("Failed to create collection:", error);
      toast.error("Could not create your collection.", { id: toastId });
    }
    return;
  }

  toast.success("Collection created.", { id: toastId, duration: 1500 });
  yield put({ type: "collections/createFinished", groupId, ok: true });

  // Non-blocking: the user is already looking at their list.
  yield fork(backfillMetadata, groupId);
}

function* deleteGroup({ groupId }) {
  yield call(ensureSignedIn);
  try {
    yield call(fs.deleteDoc, fs.doc(db, COLLECTION, groupId));
    yield put({ type: "collections/removed", groupId });
    toast.success("Collection deleted.");
  } catch (error) {
    console.error("Failed to delete collection:", error);
    toast.error("Could not delete this collection.");
  }
}

function* createItem({ groupId, url }) {
  const link = fixUrl(url);
  if (!link) {
    toast.error("A link is required.");
    return;
  }

  yield call(ensureSignedIn);

  const itemId = uuidv4();
  const existingIds = yield select(
    (store) => store.collections.groups[groupId]?.itemIds || []
  );

  const itemData = {
    id: itemId,
    link,
    title: "",
    snippet: "",
    imageUrl: "",
    order: existingIds.length
  };

  const toastId = toast.loading("Adding link...");
  yield put({ type: "collections/itemSaving", itemId, saving: true });

  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), {
      [`items.${itemId}`]: itemData
    });
  } catch (error) {
    console.error("Failed to add item:", error);
    toast.error("Could not add that link.", { id: toastId });
    yield put({ type: "collections/itemSaving", itemId, saving: false });
    return;
  }

  toast.success("Link added.", { id: toastId, duration: 1500 });

  // The card is already on screen via the snapshot listener; the preview fills
  // itself in a moment later rather than holding up the write.
  try {
    const response = yield call(
      httpsCallable(functions, "getUrlMetadata"),
      { url: link }
    );
    const metadata = response?.data || {};
    if (metadata.title || metadata.snippet || metadata.imageUrl) {
      yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), {
        [`items.${itemId}`]: {
          ...itemData,
          title: metadata.title || "",
          snippet: metadata.snippet || "",
          imageUrl: metadata.imageUrl || ""
        }
      });
    }
  } catch (error) {
    // A missing preview is cosmetic — the link itself already saved.
    console.warn("Could not load a preview for that link:", error);
  } finally {
    yield put({ type: "collections/itemSaving", itemId, saving: false });
  }
}

/**
 * Saves an edit-mode draft in a single update: only the fields that changed,
 * so a reorder does not rewrite every item and a collaborator's edit to
 * something the owner never touched survives. On failure the draft stays, so
 * nothing the owner did is lost.
 */
function* saveDraft({ groupId }) {
  const draft = yield select((store) => store.collections.drafts[groupId]);
  if (!draft) return;

  const updates = draftUpdates(draft, fs.deleteField());
  if (Object.keys(updates).length === 0) {
    yield put({ type: "collections/draftSaved", groupId });
    return;
  }

  yield put({ type: "collections/draftSaving", groupId, saving: true });
  yield call(ensureSignedIn);

  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), updates);
  } catch (error) {
    console.error("Failed to save changes:", error);
    yield put({ type: "collections/draftSaving", groupId, saving: false });
    toast.error("Could not save your changes. They’re still here — try again.");
    return;
  }

  yield put({ type: "collections/draftSaved", groupId });
  toast.success("Changes saved.", { duration: 1500 });
}

// Parallel lookups when suggesting details: quick for a typical list, and
// gentle on the per-user preview quota the server enforces.
const SUGGEST_CONCURRENCY = 4;

const DETAIL_FIELDS = ["title", "snippet", "imageUrl"];

// Everything the page says about itself; the review dialog works out which
// of it would add to or replace what the link already has.
function* lookUpDetails(callable, { id, link }) {
  try {
    const response = yield call(callable, { url: link });
    const metadata = response?.data || {};
    const found = {};
    for (const field of DETAIL_FIELDS) {
      const value = metadata[field];
      if (typeof value === "string" && value.trim()) found[field] = value.trim();
    }
    return { itemId: id, found };
  } catch (error) {
    // One unreachable site should not end the lookup for the rest.
    console.warn(`Could not look up details for ${link}:`, error?.message);
    return { itemId: id, found: {} };
  }
}

function* runSuggestions(groupId, items) {
  yield call(ensureSignedIn);
  const callable = httpsCallable(functions, "getUrlMetadata");
  for (let index = 0; index < items.length; index += SUGGEST_CONCURRENCY) {
    const batch = items.slice(index, index + SUGGEST_CONCURRENCY);
    const results = yield all(batch.map((item) => call(lookUpDetails, callable, item)));
    for (const result of results) {
      yield put({ type: "collections/suggestionsResult", groupId, ...result });
    }
  }
  yield put({ type: "collections/suggestionsFinished", groupId });
}

/**
 * Looks up the title, description and image each link's page gives now, and
 * parks them for the owner to review — additions and replacements alike, but
 * nothing is applied until they accept it. Closing the review dialog cancels
 * whatever is still running.
 */
function* suggestDetails({ groupId, items }) {
  yield put({ type: "collections/suggestionsStarted", groupId, total: items.length });
  yield race({
    done: call(runSuggestions, groupId, items),
    cancelled: take(
      (action) =>
        action.type === "collections/suggestionsCleared" && action.groupId === groupId
    )
  });
}

/**
 * A link added in edit mode fetches its preview straight away, as it would
 * outside edit mode, but into the draft: cancelling the edit drops it along
 * with the link.
 */
function* fetchDraftItemDetails({ groupId, item }) {
  yield put({ type: "collections/itemSaving", itemId: item.id, saving: true });
  try {
    yield call(ensureSignedIn);
    const response = yield call(httpsCallable(functions, "getUrlMetadata"), {
      url: item.link
    });
    yield put({
      type: "collections/draftFillItem",
      groupId,
      itemId: item.id,
      metadata: response?.data || {}
    });
  } catch (error) {
    // A missing preview is cosmetic; "Fill in details" can try again later.
    console.warn("Could not load a preview for that link:", error);
  } finally {
    yield put({ type: "collections/itemSaving", itemId: item.id, saving: false });
  }
}

export function* watchDataGroupsApp() {
  yield takeEvery("collections/subscribe", subscribeGroup);
  yield takeLatest("collections/create", createGroup);
  yield takeLatest("collections/delete", deleteGroup);
  yield takeEvery("collections/createItem", createItem);
  // One save at a time: a second press of Save while the first is in flight
  // is ignored rather than writing the same changes twice.
  yield takeLeading("collections/saveDraft", saveDraft);
  yield takeLatest("collections/suggestDetails", suggestDetails);
  yield takeEvery("collections/draftAddItem", fetchDraftItemDetails);
  yield takeLatest("session/fetchDomains", fetchAccessibleGroups);
}
