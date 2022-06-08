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
  isLoading: new Map(),
  newItemId: null, // the itemId of newly created item
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_ITEM_WITH_DATA": {
      let newData = state.data;
      newData.set(action.id, action.data);
      return { ...state, data: newData };
    }
    case "SET_ITEM_LOADING_STATUS": {
      let newLoadingStatus = state.isLoading;
      newLoadingStatus.set(action.id, action.isLoading);
      return { ...state, status: newLoadingStatus };
    }
    case "SET_NEW_ITEM_ID":
      return { ...state, newItemId: action.id };
    default:
      return { ...state };
  }
}
