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
  let itemIds = useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.itemIds || []
  );
  itemIds.sort();
  return itemIds;
}

function useGroupUpdateStatus(id) {
  return useSelector((store) =>
    store.DataGroupsReducer.groupUpdateStatus.get(id)
  );
}

function useItemData(id) {
  return useSelector((store) => store.DataGroupsReducer.items.get(id));
}

function useItemlink(id) {
  return useSelector((store) => store.DataGroupsReducer.items.get(id)?.link);
}

function useItemIsUpdating(id) {
  return useSelector(
    (store) => store.DataGroupsReducer.itemsUpdateStatus.get(id)?.isUpdating
  );
}

export {
  useGroupInfo,
  useGroupTitle,
  useGroupItemIds,
  useGroupUpdateStatus,
  useItemData,
  useItemIsUpdating,
  useItemlink,
};
