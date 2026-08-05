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
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as fs from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { db, functions } from "../../../firebase";
import { fixUrl, validateShortUrl } from "../../../components/Utilities/Helpers";
import { ensureSignedIn } from "../Session/index";

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

  const uid = yield call(ensureSignedIn);
  if (!uid) {
    toast.error("Could not start a session. Please try again.");
    return;
  }

  yield put({ type: "collections/createStarted", groupId });
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

function* renameGroup({ groupId, title }) {
  const trimmed = String(title || "").trim();
  if (!trimmed) {
    toast.error("A collection needs a title.");
    return;
  }

  yield call(ensureSignedIn);

  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), {
      title: trimmed
    });
    toast.success("Title updated.");
  } catch (error) {
    console.error("Failed to rename collection:", error);
    toast.error("Could not rename this collection.");
  }
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

function* updateItem({ itemId, groupId, data }) {
  yield call(ensureSignedIn);
  yield put({ type: "collections/itemSaving", itemId, saving: true });

  const current = yield select((store) => store.collections.items[itemId] || {});
  const next = { ...current, ...data };
  if (next.link) next.link = fixUrl(next.link);

  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), {
      [`items.${itemId}`]: next
    });
    toast.success("Saved.", { duration: 1500 });
  } catch (error) {
    console.error("Failed to update item:", error);
    toast.error("Could not save your changes.");
  } finally {
    yield put({ type: "collections/itemSaving", itemId, saving: false });
  }
}

function* deleteItem({ groupId, itemId }) {
  yield call(ensureSignedIn);
  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), {
      [`items.${itemId}`]: fs.deleteField()
    });
    toast.success("Link removed.", { duration: 1500 });
  } catch (error) {
    console.error("Failed to delete item:", error);
    toast.error("Could not remove that link.");
  }
}

function* reorderItems({ groupId, itemIds }) {
  yield call(ensureSignedIn);
  // Reflect the drop immediately, then persist. Waiting for the round-trip
  // makes the card visibly snap back to its old position first.
  yield put({ type: "collections/reorderOptimistic", groupId, itemIds });

  const items = yield select((store) => store.collections.items);
  const update = {};
  itemIds.forEach((itemId, index) => {
    if (items[itemId]) {
      update[`items.${itemId}`] = { ...items[itemId], order: index };
    }
  });

  try {
    yield call(fs.updateDoc, fs.doc(db, COLLECTION, groupId), update);
  } catch (error) {
    console.error("Failed to save the new order:", error);
    toast.error("Could not save the new order.");
  }
}

export function* watchDataGroupsApp() {
  yield takeEvery("collections/subscribe", subscribeGroup);
  yield takeLatest("collections/create", createGroup);
  yield takeLatest("collections/rename", renameGroup);
  yield takeLatest("collections/delete", deleteGroup);
  yield takeEvery("collections/createItem", createItem);
  yield takeEvery("collections/updateItem", updateItem);
  yield takeEvery("collections/deleteItem", deleteItem);
  yield takeLatest("collections/reorder", reorderItems);
  yield takeLatest("session/fetchDomains", fetchAccessibleGroups);
}
