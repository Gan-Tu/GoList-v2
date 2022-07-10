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

import { useState } from "react";
import { useUpdateEffect } from "react-use";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ItemEditForm from "./ItemEditForm";
import ItemSnippet from "./ItemSnippet";
import Modal from "../Utilities/Modal";
import { PencilEditIcon, TrashIcon } from "../Utilities/SvgIcons";
import { useItemlink, useItemData } from "../../hooks/data";

function fixUrl(url) {
  if (!url?.startsWith("http")) {
    url = `http://${url}`;
  }
  return url;
}

function ItemControls({ id, groupId }) {
  const itemData = useItemData(id);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  // Whenever source item data is updated, close the edit/delete modals.
  useUpdateEffect(() => {
    const timer = setTimeout(() => {
      setEditMode(false);
      setDeleteMode(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [itemData]);

  return (
    <>
      <Modal
        title="Edit Item Details"
        isOpen={editMode}
        onClose={() => setEditMode(false)}
      >
        <ItemEditForm
          itemId={id}
          groupId={groupId}
          toastIfNoUpdatesMade={true}
        />
      </Modal>
      <DeleteConfirmationModal
        itemId={id}
        groupId={groupId}
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

export default function ItemCard({ id, groupId, showControls }) {
  const link = useItemlink(id);
  if (showControls) {
    return (
      <div className="sm:py-4 border rounded-lg p-4 hover:shadow-lg">
        <ItemSnippet id={id} />
        <ItemControls id={id} groupId={groupId} />
      </div>
    );
  } else {
    return (
      <div className="sm:py-4 border rounded-lg p-4 hover:shadow-lg">
        <a href={fixUrl(link) || "#"} target="_blank" rel="noreferrer">
          <ItemSnippet id={id} />
        </a>
      </div>
    );
  }
}
