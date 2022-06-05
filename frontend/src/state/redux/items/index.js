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

function* fetchItem({ id }) {
  const resp = yield call(
    fetchWithTimeout,
    `http://localhost:8080/items/${id}`
  );
  if (!resp.ok) {
    console.error(resp.statusText);
    return;
  }
  const data = yield resp.json();
  if (!!data) {
    yield put({ type: "SET_ITEM_WITH_DATA", id, data });
  }
}

function* updateItem({ id, data }) {
  const existingItemData = yield select(
    (store) => store.ItemsReducer.data.get(id) || {}
  );

  // Marks update as in progress & shows notification if 1 second passed.
  yield put({
    type: "SET_ITEM_LOADING_STATUS",
    id: id,
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
    `http://localhost:8080/items/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData }),
    }
  );

  // Clear any loading animations
  toast.dismiss(toastId);
  clearTimeout(timer);
  yield put({
    type: "SET_ITEM_LOADING_STATUS",
    id: id,
    isLoading: false,
  });

  // Inform update status
  if (resp.ok) {
    yield put({ type: "SET_ITEM_WITH_DATA", id, data: newData });
    toast.success("Updated item details successfully");
  } else {
    console.error("Failed to POST", resp);
    toast.error(`Failed to update item: ${resp.statusText}`);
  }
}

export function* watchItemApp() {
  yield takeEvery("FETCH_ITEM", fetchItem);
  yield takeLatest("UPDATE_ITEM", updateItem);
}
