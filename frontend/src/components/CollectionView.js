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

import { useParams } from "react-router-dom";
import { useCollectionTitle, useCollectionItems } from "../hooks/collections";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import ItemView from "./Items/ItemView";
import { AdjustmentIcon, PlusCircleIcon } from "./Utilities/SvgIcons";
import CreateFlow from "./CreateFlow";

export default function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const title = useCollectionTitle(id);
  const itemIds = useCollectionItems(id);

  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [dispatch, id]);

  return (
    <motion.div
      layout
      className="p-5 mt-10 min-w-m bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700"
    >
      {/* TODO(tugan): Clear create modal after successful create */}
      <CreateFlow
        collectionId={id}
        isOpen={createMode}
        onClose={() => {
          setCreateMode(false);
          dispatch({ type: "SET_NEW_ITEM_ID", itemId: null });
        }}
      />
      <div className="flex justify-between items-center text-center h-15 pl-4 pr-4 pb-4 space-y-2">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {title}
        </h5>
        {editMode ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setEditMode(!editMode)}
            className="text-sm font-medium text-black flex space-y-4 items-center"
          >
            <p className="w-6 h-6 font-bold">Done</p>
          </motion.button>
        ) : (
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setEditMode(!editMode)}
              className="text-sm font-medium text-black flex space-y-4 items-center"
            >
              <AdjustmentIcon className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setCreateMode(!createMode)}
              className="text-sm font-medium text-black flex space-y-4 -mr-4 items-center"
            >
              <PlusCircleIcon className="w-6 h-6" />
            </motion.button>
          </div>
        )}
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
                  <ItemView
                    id={itemId}
                    collectionId={id}
                    showControls={editMode}
                  />
                </motion.li>
              ))
            : null}
        </ul>
      </div>
    </motion.div>
  );
}
