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

import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import toast from "react-hot-toast";
import { db, functions } from "../../../firebase";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

function* fetchItems({ collectionId }) {
  const ref = collection(db, "collections", collectionId, "items");
  const querySnapshot = yield call(getDocs, ref);
  for (let i = 0; i < querySnapshot.docs.length; i++) {
    let itemData = querySnapshot.docs[i].data();
    itemData = { ...itemData, id: querySnapshot.docs[i].id, collectionId };
    if (itemData) {
      yield put({
        type: "SET_ITEM_WITH_DATA",
        id: itemData.id,
        data: itemData,
      });
      yield put({
        type: "ADD_ITEM_ID_TO_COLLECTION",
        collectionId,
        itemId: itemData.id,
      });
    }
  }
}

function* updateItem({ itemId, collectionId, data }) {
  const existingItemData = yield select(
    (store) => store.ItemsReducer.data.get(itemId) || {}
  );
  const newData = { ...existingItemData, ...data };

  // Marks update as in progress & shows notification if 1 second passed.
  yield put({
    type: "SET_ITEM_LOADING_STATUS",
    id: itemId,
    isLoading: true,
  });
  let toastId;
  const timer = setTimeout(() => {
    toastId = toast.loading("Still saving the data...");
  }, 1000);

  // Post to the API the update
  const docRef = doc(db, "collections", collectionId, "items", itemId);
  yield call(updateDoc, docRef, newData);

  // Clear any loading animations
  toast.dismiss(toastId);
  clearTimeout(timer);
  yield put({
    type: "SET_ITEM_LOADING_STATUS",
    id: itemId,
    isLoading: false,
  });

  yield put({ type: "SET_ITEM_WITH_DATA", id: itemId, data: newData });
  toast.success("Updated item details successfully");
}

function* createItem({ collectionId, url }) {
  let toastId = toast.loading("Creating new item...", { duration: 5000 });
  const result = yield call(httpsCallable(functions, "getUrlMetadata"), url);
  const metadata = result.data;
  const itemData = {
    title:
      metadata.twitterTitle ||
      metadata.ogTitle ||
      metadata.title ||
      metadata.twitterSite ||
      "",
    snippet:
      metadata.twitterDescription ||
      metadata.ogDescription ||
      metadata.description ||
      "",
    imageUrl: metadata.twitterImage || metadata.ogImage || metadata.icon || "",
    link: url,
  };
  const docRef = yield call(
    addDoc,
    collection(db, "collections", collectionId, "items"),
    itemData
  );
  if (!docRef.id) {
    console.error("Failed to find the ID for newly created item");
    toast.dismiss(toastId);
    toast.error("Failed to create new item.");
    return;
  }
  toast.dismiss(toastId);
  toast.success("New item successfully created");
  yield put({
    type: "SET_ITEM_WITH_DATA",
    id: docRef.id,
    data: { ...itemData, collectionId, id: docRef.id },
  });
  yield put({
    type: "ADD_ITEM_ID_TO_COLLECTION",
    collectionId,
    itemId: docRef.id,
  });
  yield put({ type: "SET_NEW_ITEM_ID", id: docRef.id });
}

function* deleteItem({ itemId, collectionId }) {
  const docRef = doc(db, "collections", collectionId, "items", itemId);
  yield call(deleteDoc, docRef);
  yield put({
    type: "REMOVE_ITEM_ID_FROM_COLLECTION",
    collectionId,
    itemId,
  });
  toast.success("Item deleted successfuly.");
}

export function* watchItemApp() {
  yield takeLatest("FETCH_ITEMS", fetchItems);
  yield takeLatest("UPDATE_ITEM", updateItem);
  yield takeLatest("CREATE_ITEM", createItem);
  yield takeLatest("DELETE_ITEM", deleteItem);
}
