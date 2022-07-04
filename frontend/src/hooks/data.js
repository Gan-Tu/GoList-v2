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

import { useSelector } from "react-redux";

function useGroupInfo(id) {
  return useSelector((store) => store.DataGroupsReducer.groupInfo.get(id));
}

function useGroupTitle(id) {
  return useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.title
  );
}

function useGroupItemIds(id) {
  return useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.itemIds || []
  );
}

function useItemData(id) {
  return useSelector((store) => store.DataGroupsReducer.items.get(id));
}

function useItemlink(id) {
  return useSelector((store) => store.DataGroupsReducer.items.get(id)?.link);
}

// function useItemIsLoading(id) {
//   return useSelector((store) => store.DataGroupsReducer.isLoading.get(id));
// }

// function useNewItemId() {
//   return useSelector((store) => store.DataGroupsReducer.newItemId);
// }

export {
  useGroupInfo,
  useGroupTitle,
  useGroupItemIds,
  useItemData,
  // useItemIsLoading,
  useItemlink,
  // useNewItemId,
};
