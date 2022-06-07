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

const initialState = {
  data: new Map(),
  itemIdsPerCollection: new Map(),
};

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_COLLECTION_SUCCESS": {
      let newData = state.data;
      newData.set(action.id, action.data);
      return { ...state, data: newData };
    }
    case "FETCH_COLLECTION_FAILED":
      return state;
    case "ADD_ITEM_ID_TO_COLLECTION": {
      let newMapping = state.itemIdsPerCollection;
      let newIds = newMapping.get(action.collectionId) || [];
      newIds.push(action.itemId);
      newMapping.set(action.collectionId, [...newIds]);
      return { ...state, itemIdsPerCollection: newMapping };
    }
    case "REMOVE_ITEM_ID_FROM_COLLECTION": {
      let newMapping = state.itemIdsPerCollection;
      let newIds = newMapping.get(action.collectionId) || [];
      removeItemOnce(newIds, action.itemId);
      newMapping.set(action.collectionId, [...newIds]);
      console.log(newMapping);
      return { ...state, itemIdsPerCollection: newMapping };
    }
    default:
      return { ...state };
  }
}
