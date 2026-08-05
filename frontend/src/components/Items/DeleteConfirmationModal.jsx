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

import { useDispatch } from "react-redux";
import Modal from "../Utilities/Modal";
import { ItemSnippetView } from "./ItemSnippet";
import { useItemData } from "../../hooks/data";

export default function DeleteConfirmationModal({
  itemId,
  groupId,
  isOpen,
  onClose
}) {
  const dispatch = useDispatch();
  const data = useItemData(itemId);

  const onDelete = () => {
    dispatch({ type: "collections/deleteItem", groupId, itemId });
    onClose();
  };

  return (
    <Modal title="Delete this link?" isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 space-y-4">
        {/* Showing the card being deleted removes the guesswork about which
            link the confirmation refers to. */}
        <div className="rounded-lg border border-gray-200 p-4">
          <ItemSnippetView data={data} />
        </div>
        <p className="text-sm text-gray-600">This can’t be undone.</p>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete link
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
