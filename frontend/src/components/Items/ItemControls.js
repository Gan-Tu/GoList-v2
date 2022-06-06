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

import { useEffect, useState } from "react";
import ItemModal from "./ItemModal";
import DeleteConfirmation from "./DeleteConfirmation";
import { PencilEditIcon, TrashIcon } from "../Utilities/SvgIcons";
import { useItemData } from "../../hooks/items";
import { useUpdateEffect } from "react-use";

export default function ItemControls({ id, collectionId }) {
  const itemData = useItemData(id);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  // Whenever source item data is updated, close the edit modal.
  useUpdateEffect(() => {
    const timer = setTimeout(() => setEditMode(false), 1000);
    return () => clearTimeout(timer);
  }, [itemData]);

  return (
    <>
      <ItemModal
        itemId={id}
        isOpen={editMode}
        onClose={() => setEditMode(false)}
      />
      <DeleteConfirmation
        itemId={id}
        collectionId={collectionId}
        isOpen={deleteMode}
        onClose={() => setDeleteMode(false)}
      />
      <div className="pt-2 space-x-4">
        <button
          className="inline-flex items-center text-xs text-blue-500 font-normal hover:underline dark:text-gray-400"
          onClick={() => setEditMode(!editMode)}
        >
          <PencilEditIcon className="w-4 h-4" /> Edit
        </button>
        <button
          className="inline-flex items-center text-xs text-blue-500 font-normal hover:underline dark:text-gray-400"
          onClick={() => setDeleteMode(!deleteMode)}
        >
          <TrashIcon className="w-4 h-4" /> Delete
        </button>
      </div>
    </>
  );
}
