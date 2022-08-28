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

import { useNavigate, useParams } from "react-router-dom";
import { useGroupUpdateStatus, useCollectionViewData } from "../../hooks/data";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import ItemCard from "../Items/ItemCard";
import * as Icons from "../Utilities/SvgIcons";
import CreateItemModal from "../Items/CreateItemModal";
import DeleteCollectionConfirmationModal from "./DeleteCollectionConfirmationModal";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";

export default function CollectionView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const status = useGroupUpdateStatus(id);
  const [mode, setMode] = useState(null);
  const { title, itemIds, isOwner } = useCollectionViewData(id);

  useEffect(() => {
    dispatch({ type: "FETCH_GROUP", groupId: id });
  }, [dispatch, id]);

  useEffect(() => {
    if (
      status?.mode === "fetch" &&
      status?.dataType === "group" &&
      status?.notFound
    ) {
      toast.error(`Page /${id} not found`);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [status, navigate, id]);

  if (!itemIds?.length) {
    return (
      <button
        disabled
        type="button"
        className="py-2.5 px-5 mr-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-400 inline-flex items-center"
      >
        <Icons.LoaderIcon className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600" />
        Loading...
      </button>
    );
  }

  let editPanel = (
    <>
      <DeleteCollectionConfirmationModal
        groupId={id}
        isOpen={mode === "delete"}
        onClose={() => {
          setMode(null);
        }}
      />

      {mode === "edit" ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setMode(null)}
          className="text-sm font-medium text-black flex space-y-4 items-center"
        >
          <p className="w-6 h-6 font-bold">Done</p>
        </motion.button>
      ) : (
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setMode("edit")}
            className="text-sm font-medium text-black flex space-y-4 items-center"
          >
            <Icons.AdjustmentIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setMode("delete")}
            className="text-sm font-medium text-black flex space-y-4 -mr-4 items-center"
          >
            <Icons.TrashIcon className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setMode("create")}
            className="text-sm font-medium text-black flex space-y-4 -mr-4 items-center"
          >
            <Icons.PlusCircleIcon className="w-6 h-6" />
          </motion.button>
        </div>
      )}
    </>
  );

  return (
    <motion.div
      layout
      className="p-5 min-w-m bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700"
    >
      {title && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}
      <CreateItemModal
        groupId={id}
        isOpen={mode === "create"}
        onClose={() => {
          setMode(null);
          dispatch({
            type: "SET_GROUP_UPDATE_STATUS",
            id: id,
            status: {
              isUpdating: false,
              newItemId: null
            }
          });
        }}
      />
      <div className="flex justify-between items-center text-center h-15 pl-4 pr-4 pb-4 space-y-2">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {title}
        </h5>
        {isOwner && editPanel}
      </div>
      <div>
        <ul
          className={`grid sm:grid-cols-1 ${
            // Only show 2 column row layout if at least 4 items
            itemIds?.length >= 4 ? "lg:grid-cols-2" : ""
          } gap-4`}
        >
          {itemIds
            ? itemIds.map((itemId) => (
                <motion.li layout key={`item-${itemId}`}>
                  <ItemCard
                    id={itemId}
                    groupId={id}
                    showControls={mode === "edit"}
                  />
                </motion.li>
              ))
            : null}
        </ul>
      </div>
    </motion.div>
  );
}
