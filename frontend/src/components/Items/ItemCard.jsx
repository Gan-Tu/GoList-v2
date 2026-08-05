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
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ItemEditForm from "./ItemEditForm";
import ItemSnippet from "./ItemSnippet";
import Modal from "../Utilities/Modal";
import { PencilSquareIcon, Spinner, TrashIcon } from "../Utilities/SvgIcons";
import { safeHref } from "../Utilities/Helpers";
import { useItemIsSaving, useItemLink } from "../../hooks/data";

export const CARD_CLASS =
  "rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md";

// Exported so the lazily-loaded sortable list can reuse it without pulling
// drag-and-drop into this module — and therefore into the initial bundle.
export function ItemControls({ id, groupId }) {
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  return (
    <>
      <Modal
        title="Edit link"
        isOpen={editMode}
        onClose={() => setEditMode(false)}
      >
        <ItemEditForm
          itemId={id}
          groupId={groupId}
          // Closing on an explicit save result, rather than the old 1-second
          // timer that fired whether or not the write had landed.
          onSaved={() => setEditMode(false)}
          onCancel={() => setEditMode(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        itemId={id}
        groupId={groupId}
        isOpen={deleteMode}
        onClose={() => setDeleteMode(false)}
      />

      <div className="mt-3 flex gap-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
          onClick={() => setEditMode(true)}
        >
          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          onClick={() => setDeleteMode(true)}
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </>
  );
}

export default function ItemCard({ id, groupId, showControls }) {
  const link = useItemLink(id);
  const isSaving = useItemIsSaving(id);
  const href = safeHref(link);

  if (showControls) {
    return (
      <div className={CARD_CLASS}>
        <ItemSnippet id={id} />
        <ItemControls id={id} groupId={groupId} />
      </div>
    );
  }

  const body = (
    <>
      <ItemSnippet id={id} />
      {isSaving && (
        <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <Spinner className="h-3 w-3" />
          Fetching preview…
        </p>
      )}
    </>
  );

  // A stored link that is not http(s) gets no href at all rather than becoming
  // a clickable javascript: URL in someone else's browser.
  if (!href) {
    return <div className={CARD_CLASS}>{body}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`block ${CARD_CLASS} focus:outline-none focus:ring-2 focus:ring-gray-900`}
    >
      {body}
    </a>
  );
}
