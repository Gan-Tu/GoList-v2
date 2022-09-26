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
import { useLoggedInUserId } from "./session";

function useGroupInfo(id) {
  return useSelector((store) => store.DataGroupsReducer.groupInfo.get(id));
}

function useCollectionViewData(id) {
  const uid = useSelector((store) => store.SessionReducer.user?.uid);
  const title = useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.title
  );
  const itemIds = useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.itemIds || []
  );
  const ownerId = useSelector(
    (store) => store.DataGroupsReducer.groupInfo.get(id)?.ownerId
  );
  return {
    title,
    itemIds: itemIds.slice(0).sort(),
    isOwner: (!!uid && ownerId === uid) || ownerId === "PUBLIC"
  };
}

function useGroupUpdateStatus(id) {
  return useSelector((store) =>
    store.DataGroupsReducer.groupUpdateStatus.get(id)
  );
}

function useGroupsAccessible() {
  const uid = useLoggedInUserId();
  return useSelector((store) => store.SessionReducer.domainData).filter(
    (doc) => doc?.ownerId === "PUBLIC" || doc?.ownerId === uid
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
  useGroupUpdateStatus,
  useItemData,
  useItemIsUpdating, // used once
  useItemlink, // used once
  useCollectionViewData,
  useGroupsAccessible
};
