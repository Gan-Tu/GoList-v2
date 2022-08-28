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
import {
  doc,
  deleteField,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { httpsCallable } from "firebase/functions";
import { fixUrl } from "../../../components/Utilities/Helpers";

function* fetchDataGroup({ groupId }) {
  const docRef = doc(db, "DataGroups", groupId);
  try {
    const documentSnapshot = yield call(getDoc, docRef);
    const data = documentSnapshot.data();
    if (!!data) {
      for (const [itemId, itemData] of Object.entries(data.items)) {
        yield put({ type: "SET_ITEM_DATA", id: itemId, data: itemData });
      }
      data.itemIds = Object.keys(data.items);
      delete data.items;
      yield put({ type: "SET_GROUP_DATA", id: groupId, data });
    } else {
      yield put({
        type: "SET_GROUP_UPDATE_STATUS",
        id: groupId,
        status: {
          mode: "fetch",
          dataType: "group",
          notFound: true
        }
      });
    }
  } catch (error) {
    toast.error(`Failed to get data.`);
    console.error(`Failed to get data: ${error}`);
  }
}

function* createGroup({ groupId, title, urls, uid }) {
  // Start group creation
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      mode: "create",
      dataType: "group",
      isUpdating: true,
      newGroupId: groupId
    }
  });
  let toastId = toast.loading("Creating new collection...", { duration: 5000 });

  // Prepare firestore document
  let itemsData = {};
  for (const url of urls.trim().split("\n")) {
    if (url.length > 0) {
      const itemId = uuidv4();
      itemsData[itemId] = {
        id: itemId,
        link: fixUrl(url)
      };
    }
  }
  let data = {
    id: groupId,
    title: title,
    items: itemsData
  };
  if (uid) {
    data.ownerId = uid;
  }

  // Save to firestore
  const docRef = doc(db, "DataGroups", groupId);
  try {
    yield call(setDoc, docRef, data);
  } catch (error) {
    toast.error("Failed to save data.");
    console.error(`Failed to save data: ${error}`);
    yield put({
      type: "SET_GROUP_UPDATE_STATUS",
      id: groupId,
      status: {
        mode: "create",
        dataType: "group",
        isUpdating: false,
        newGroupId: groupId
      }
    });
    return;
  }

  // Try populate all the url metadata
  toastId = toast.loading("Auto-populating metadata...", {
    id: toastId,
    duration: 10000
  });
  try {
    const result = yield call(
      httpsCallable(functions, "populateUrlMetadata"),
      `DataGroups/${groupId}`
    );
    if (result?.data?.items) {
      data.items = result.data.items;
    }
  } catch (error) {
    toast.error("Failed to auto populate metadata.", { id: toastId });
    console.error(`Failed to populate all the url metadata: ${error}`);
  }

  // End group creation
  toast.success("Group created successfuly.", { id: toastId, duration: 1000 });
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      mode: "create",
      dataType: "group",
      isUpdating: false,
      newGroupId: groupId
    }
  });
}

function* deleteGroup({ groupId }) {
  const docRef = doc(db, "DataGroups", groupId);
  try {
    yield call(deleteDoc, docRef);
    yield put({ type: "DELETE_GROUP_DATA", id: groupId });
    toast.success("Group deleted successfuly.");
  } catch (error) {
    toast.error(`Failed to delete data.`);
    console.error(`Failed to delete data: ${error}`);
  }
}

function* createItem({ groupId, url }) {
  const itemId = uuidv4();
  url = fixUrl(url);

  // Start item update
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      mode: "create",
      dataType: "item",
      isUpdating: true,
      newItemId: itemId
    }
  });
  let toastId = toast.loading("Creating new item...", { duration: 5000 });

  let itemData = {
    id: itemId,
    link: url,
    title: "URL",
    snippet: "",
    imageUrl: "https://picsum.photos/48"
  };

  // Try fetching url metadata
  try {
    const metadata = yield call(
      httpsCallable(functions, "getUrlMetadata"),
      url
    );
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
        ""
    };
  } catch (error) {
    console.error(`Failed to fetch url metadata: ${error}`);
  }

  // Create date remotely and locally
  const docRef = doc(db, "DataGroups", groupId);
  let update = {};
  update[`items.${itemId}`] = itemData;

  let success = false;
  try {
    yield call(updateDoc, docRef, update);
    yield put({
      type: "SET_ITEM_DATA",
      id: itemId,
      data: itemData
    });
    yield put({ type: "ADD_ITEM_ID_TO_GROUP", groupId, itemId });
    success = true;
  } catch (error) {
    console.error(`Failed to save data: ${error}`);
  }

  // Clear any loading animations
  toast.dismiss(toastId);

  // End item update
  if (success) {
    toast.success("New item successfully created");
  } else {
    toast.error("Failed to save data.");
  }
  yield put({
    type: "SET_GROUP_UPDATE_STATUS",
    id: groupId,
    status: {
      mode: "create",
      dataType: "item",
      isUpdating: false,
      newItemId: itemId
    }
  });
}

function* updateItem({ itemId, groupId, data }) {
  // Start item update
  yield put({
    type: "SET_ITEM_UPDATE_STATUS",
    id: itemId,
    status: {
      isUpdating: true
    }
  });

  if (data?.link) {
    data.link = fixUrl(data.link);
  }

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

  let success = false;
  try {
    yield call(updateDoc, docRef, update);
    yield put({
      type: "SET_ITEM_DATA",
      id: itemId,
      data: newData
    });
    success = true;
  } catch (error) {
    console.error(`Failed to update data: ${error}`);
  }

  // Clear any loading animations
  toast.dismiss(toastId);
  clearTimeout(timer);

  // End item update
  if (success) {
    toast.success("Updated item details successfully");
  } else {
    toast.error("Failed to update data");
  }

  yield put({
    type: "SET_ITEM_UPDATE_STATUS",
    id: itemId,
    status: {
      isUpdating: false
    }
  });
}

function* deleteItem({ groupId, itemId }) {
  const docRef = doc(db, "DataGroups", groupId);
  let update = {};
  update[`items.${itemId}`] = deleteField();
  try {
    yield call(updateDoc, docRef, update);
    yield put({ type: "SET_ITEM_DATA", id: itemId, data: null });
    yield put({ type: "REMOVE_ITEM_ID_FROM_GROUP", groupId, itemId });
    toast.success("Item deleted successfuly.");
  } catch (error) {
    toast.error("Failed to delete data.");
    console.error(`Failed to delete data: ${error}`);
  }
}

export function* watchDataGroupsApp() {
  yield takeEvery("FETCH_GROUP", fetchDataGroup);
  yield takeLatest("CREATE_GROUP", createGroup);
  yield takeLatest("DELETE_GROUP", deleteGroup);
  yield takeLatest("CREATE_ITEM", createItem);
  yield takeLatest("UPDATE_ITEM", updateItem);
  yield takeLatest("DELETE_ITEM", deleteItem);
}
