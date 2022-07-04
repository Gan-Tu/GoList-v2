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

import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { db } from "../../../firebase";
import { doc, deleteField, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

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
  yield takeLatest("FETCH_GROUP", fetchDataGroup);
  yield takeLatest("DELETE_ITEM", deleteItem);
}
