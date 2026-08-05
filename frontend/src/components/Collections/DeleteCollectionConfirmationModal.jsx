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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../Utilities/Modal";
import { useGroup, useItemIds } from "../../hooks/data";

export default function DeleteCollectionConfirmationModal({
  groupId,
  isOpen,
  onClose
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const group = useGroup(groupId);
  const itemIds = useItemIds(groupId);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    if (isOpen) setConfirmation("");
  }, [isOpen]);

  // Deleting a collection destroys its short URL along with every link in it,
  // and nothing here is recoverable — so this one asks the user to type the id
  // rather than accepting a single mis-aimed click.
  const canDelete = confirmation.trim() === groupId;

  const onDelete = () => {
    if (!canDelete) return;
    dispatch({ type: "collections/delete", groupId });
    onClose();
    navigate("/");
  };

  return (
    <Modal title="Delete this collection?" isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 space-y-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{group?.title}</span> and
          its {itemIds.length} link{itemIds.length === 1 ? "" : "s"} will be
          permanently deleted, and{" "}
          <span className="font-medium text-gray-900">goli.st/{groupId}</span>{" "}
          will stop working.
        </p>
        <div>
          <label
            htmlFor="delete-confirmation"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Type <span className="font-mono">{groupId}</span> to confirm
          </label>
          <input
            id="delete-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
        >
          Delete collection
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
