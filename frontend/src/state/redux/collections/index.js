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

import { call, put, takeEvery } from "redux-saga/effects";
import { fireStore } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

function* fetchCollection({ id }) {
  // const resp = yield call(fetch, `http://localhost:8080/dataApi/collections/${id}`);
  const docRef = doc(fireStore, "collections", id);
  const documentSnapshot = yield call(getDoc, docRef);
  // if (!resp.ok) {
  //   console.error(resp.statusText);
  //   return;
  // }
  // const data = yield resp.json();
  const data = documentSnapshot.data();
  console.log(data);
  if (!!data) {
    yield put({ type: "FETCH_COLLECTION_SUCCESS", id, data });
    yield put({ type: "FETCH_ITEMS", collectionId: id });
  } else {
    yield put({ type: "FETCH_COLLECTION_FAILED", id });
  }
}

export function* watchCollectionsApp() {
  yield takeEvery("FETCH_COLLECTION", fetchCollection);
}
