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

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: abortController.signal,
  });
  clearTimeout(id);
  return response;
}

function* fetchItems({ collectionId }) {
  const resp = yield call(
    fetchWithTimeout,
    `http://localhost:3000/dataApi/collections/${collectionId}/items`
  );
  if (!resp.ok) {
    console.error(resp.statusText);
    return;
  }
  const data = yield resp.json();
  if (!!data) {
    for (let i = 0; i < data.length; i++) {
      let itemData = data[i];
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
}

function* updateItem({ itemId, data }) {
  const existingItemData = yield select(
    (store) => store.ItemsReducer.data.get(itemId) || {}
  );

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
  const newData = { ...existingItemData, ...data };
  const resp = yield call(
    fetchWithTimeout,
    `http://localhost:3000/dataApi/items/${itemId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    }
  );

  // Clear any loading animations
  toast.dismiss(toastId);
  clearTimeout(timer);
  yield put({
    type: "SET_ITEM_LOADING_STATUS",
    id: itemId,
    isLoading: false,
  });

  // Inform update status
  if (resp.ok) {
    yield put({ type: "SET_ITEM_WITH_DATA", id: itemId, data: newData });
    toast.success("Updated item details successfully");
  } else {
    console.error("Failed to POST", resp);
    toast.error(`Failed to update item: ${resp.statusText}`);
  }
}

function* createItem({ collectionId, itemData }) {
  const resp = yield call(fetchWithTimeout, "http://localhost:3000/dataApi/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...itemData, collectionId }),
  });
  if (!resp.ok) {
    console.error(resp.statusText);
    toast.error(`Failed to create new item: ${resp.statusText}`);
    return;
  }
  const data = yield resp.json();
  if (!data?.id) {
    console.error("Failed to find the ID for newly created item");
    toast.error("Failed to create new item.");
    return;
  }
  toast.success("New item successfully created");
  yield put({ type: "SET_ITEM_WITH_DATA", id: data.id, data });
  yield put({
    type: "ADD_ITEM_ID_TO_COLLECTION",
    collectionId,
    itemId: data.id,
  });
}

function* deleteItem({ itemId, collectionId }) {
  const resp = yield call(
    fetchWithTimeout,
    `http://localhost:3000/dataApi/items/${itemId}`,
    {
      method: "DELETE",
    }
  );
  if (!resp.ok) {
    console.error(resp.statusText);
    toast.error(`Failed to delete item: ${resp.statusText}`);
    return;
  }
  yield put({
    type: "REMOVE_ITEM_ID_FROM_COLLECTION",
    collectionId,
    itemId,
  });
  toast.success("Item deleted successfuly.");
}

export function* watchItemApp() {
  yield takeEvery("FETCH_ITEMS", fetchItems);
  yield takeLatest("UPDATE_ITEM", updateItem);
  yield takeLatest("CREATE_ITEM", createItem);
  yield takeLatest("DELETE_ITEM", deleteItem);
}
