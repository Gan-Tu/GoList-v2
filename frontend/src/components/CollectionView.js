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

import { Link, useParams } from "react-router-dom";
import { useCollectionTitle, useCollectionItems } from "../hooks/collections";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ItemView from "./Items/ItemView";
import {
  AdjustmentIcon,
  PlusCircleIcon,
  SolidHomeIcon,
  RightChevronIcon,
} from "./Utilities/SvgIcons";

function BreadCrumb({ title }) {
  return (
    <nav className="flex p-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <SolidHomeIcon className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <RightChevronIcon className="w-6 h-6 text-gray-400" />
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
              {title}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}

export default function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [editMode, toggleEditMode] = useState(false);
  const title = useCollectionTitle(id);
  const items = useCollectionItems(id);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [dispatch, id]);

  return (
    <motion.div
      layout
      className="p-5 mt-10 min-w-m bg-white rounded-lg border shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700"
    >
      <BreadCrumb title={title} />

      <div className="flex justify-between items-center text-center h-15 pl-4 pr-4 pb-4 space-y-2">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {title}
        </h5>
        {editMode ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => toggleEditMode(!editMode)}
            className="text-sm font-medium text-black flex space-y-4 items-center"
          >
            <p className="w-6 h-6 font-bold">Done</p>
          </motion.button>
        ) : (
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => toggleEditMode(!editMode)}
              className="text-sm font-medium text-black flex space-y-4 items-center"
            >
              <AdjustmentIcon className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => toast.error("Add is unimplemented!")}
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
            items?.length >= 4 ? "lg:grid-cols-2" : ""
          } gap-4`}
        >
          {items
            ? items.map((id) => (
                <motion.li layout key={`item-${id}`}>
                  <ItemView id={id} showControls={editMode} />
                </motion.li>
              ))
            : null}
        </ul>
      </div>
    </motion.div>
  );
}
