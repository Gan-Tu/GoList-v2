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
import { db, functions } from "../../../firebase";
import { doc, deleteField, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { httpsCallable } from "firebase/functions";

function* fetchDataGroup({ groupId }) {
  const docRef = doc(db, "DataGroups", groupId);
  const documentSnapshot = yield call(getDoc, docRef);
  const data = documentSnapshot.data();
  if (!!data) {
    for (const [itemId, itemData] of Object.entries(data.items)) {
      yield put({ type: "SET_ITEM_DATA", id: itemId, data: itemData });
    }
    data.itemIds = Object.keys(data.items);
    delete data.items;
    yield put({ type: "SET_GROUP_DATA", id: groupId, data });
  }
}

function* createItem({ groupId, url }) {
  const itemId = uuidv4();

  // Start item update
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      isUpdating: true,
      newItemId: itemId,
    },
  });
  let toastId = toast.loading("Creating new item...", { duration: 5000 });

  let itemData = {
    id: itemId,
    link: url,
    title: "URL",
    snippet: "",
    imageUrl: "https://picsum.photos/48",
  };
  console.log(itemData);

  // Try fetching url metadata
  try {
    const metadata = yield call(
      httpsCallable(functions, "getUrlMetadata"),
      url
    );
    console.log(metadata);
    itemData = {
      ...itemData,
      title:
        metadata?.data?.twitterTitle ||
        metadata?.data?.ogTitle ||
        metadata?.data?.title ||
        metadata?.data?.twitterSite ||
        "",
      snippet:
        metadata?.data?.twitterDescription ||
        metadata?.data?.ogDescription ||
        metadata?.data?.description ||
        "",
      imageUrl:
        metadata?.data?.twitterImage ||
        metadata?.data?.ogImage ||
        metadata?.data?.icon ||
        "",
    };
  } catch (error) {
    console.error(`Failed to fetch url metadata: ${error}`);
  }

  // Create date remotely and locally
  const docRef = doc(db, "DataGroups", groupId);
  let update = {};
  update[`items.${itemId}`] = itemData;
  yield call(updateDoc, docRef, update);
  console.log("update", update);
  yield put({
    type: "SET_ITEM_DATA",
    id: itemId,
    data: itemData,
  });
  yield put({ type: "ADD_ITEM_ID_TO_GROUP", groupId, itemId });

  // Clear any loading animations
  toast.dismiss(toastId);

  // End item update
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      isUpdating: false,
      newItemId: itemId,
    },
  });
  toast.success("New item successfully created");
}

function* updateItem({ itemId, groupId, data }) {
  // Start item update
  yield put({
    type: "SET_ITEM_UPDATE_STATUS",
    id: itemId,
    status: {
      isUpdating: true,
    },
  });

  // Show saving in progress notification after 1 second.
  let toastId;
  const timer = setTimeout(() => {
    toastId = toast.loading("Still saving the data...");
  }, 1000);

  // Update date remotely and locally
  const docRef = doc(db, "DataGroups", groupId);
  const currentData = yield select(
    (store) => store.DataGroupsReducer.items.get(itemId) || {}
  );
  const newData = { ...currentData, ...data };
  let update = {};
  update[`items.${itemId}`] = newData;
  yield call(updateDoc, docRef, update);
  yield put({
    type: "SET_ITEM_DATA",
    id: itemId,
    data: newData,
  });

  // Clear any loading animations
  toast.dismiss(toastId);
  clearTimeout(timer);

  // End item update
  yield put({
    type: "SET_ITEM_UPDATE_STATUS",
    id: itemId,
    status: {
      isUpdating: false,
    },
  });

  toast.success("Updated item details successfully");
}

function* deleteItem({ groupId, itemId }) {
  const docRef = doc(db, "DataGroups", groupId);
  let update = {};
  update[`items.${itemId}`] = deleteField();
  yield call(updateDoc, docRef, update);
  yield put({ type: "SET_ITEM_DATA", id: itemId, data: null });
  yield put({ type: "REMOVE_ITEM_ID_FROM_GROUP", groupId, itemId });
  toast.success("Item deleted successfuly.");
}

export function* watchDataGroupsApp() {
  yield takeEvery("FETCH_GROUP", fetchDataGroup);
  yield takeLatest("CREATE_ITEM", createItem);
  yield takeLatest("UPDATE_ITEM", updateItem);
  yield takeLatest("DELETE_ITEM", deleteItem);
}
