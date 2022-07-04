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
  groupInfo: new Map(),
  items: new Map(),
  itemsUpdateStatus: new Map(),
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
    case "SET_GROUP_DATA": {
      let newGroupInfo = new Map(state.groupInfo);
      newGroupInfo.set(action.id, action.data);
      return {
        ...state,
        groupInfo: newGroupInfo,
      };
    }
    case "SET_ITEM_DATA": {
      let newItems = new Map(state.items);
      if (!!action.data) {
        newItems.set(action.id, action.data);
      } else {
        newItems.delete(action.id);
      }
      return {
        ...state,
        items: newItems,
      };
    }
    case "SET_ITEM_UPDATE_STATUS": {
      let newStatus = new Map(state.itemsUpdateStatus);
      newStatus.set(action.id, action.status);
      return {
        ...state,
        itemsUpdateStatus: newStatus,
      };
    }
    case "REMOVE_ITEM_ID_FROM_GROUP": {
      let newGroupInfo = new Map(state.groupInfo);
      let newGroup = newGroupInfo.get(action.groupId);
      if (newGroup?.itemIds) {
        newGroup.itemIds = [...newGroup.itemIds];
        removeItemOnce(newGroup.itemIds, action.itemId);
      }
      return {
        ...state,
        groupInfo: newGroupInfo,
      };
    }
    // case "PUT_DATA_GROUP": {
    //   let newData = state.data;
    //   newData.set(action.id, action.data);
    //   return { ...state, data: newData };
    // }
    // case "REMOVE_ITEM": {
    //   let collection = state.data.get(action.collectionId);
    //   if (collection) {
    //     delete collection.items[action.itemId];
    //   }
    //   return { ...state, data: newData };
    // }
    // case "REMOVE_ITEM_ID_FROM_COLLECTION": {
    //   let newMapping = state.itemIdsPerCollection;
    //   let newIds = newMapping.get(action.collectionId) || [];
    //   removeItemOnce(newIds, action.itemId);
    //   newMapping.set(action.collectionId, [...newIds]);
    //   console.log(newMapping);
    //   return { ...state, itemIdsPerCollection: newMapping };
    // }
    default:
      return { ...state };
  }
}
