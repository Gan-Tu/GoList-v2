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

function* fetchItem({ id }) {
  const resp = yield call(fetch, `http://localhost:8080/items/${id}`);
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
  const existingItemData = yield select((store) =>
    store.ItemsReducer.data.get(id)
  );
  if (existingItemData) {
    const newData = { ...existingItemData, ...data };
    console.log(id, newData);
    yield put({ type: "SET_ITEM_WITH_DATA", id, data: newData });
  }
}

export function* watchItemApp() {
  yield takeEvery("FETCH_ITEM", fetchItem);
  yield takeLatest("UPDATE_ITEM", updateItem);
}
