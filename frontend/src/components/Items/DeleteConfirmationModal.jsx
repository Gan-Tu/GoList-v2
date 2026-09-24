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

import { useRef } from "react";
import { useDispatch } from "react-redux";
import { ItemRowSummary, ROW_CLASS } from "./ItemRow";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import { classNames, safeHref } from "../Utilities/Helpers";
import { useDraftItem } from "../../hooks/data";

export default function DeleteConfirmationModal({
  itemId,
  groupId,
  isOpen,
  onClose
}) {
  const dispatch = useDispatch();
  const data = useDraftItem(groupId, itemId);
  // Focus starts on Cancel: Enter on a freshly opened "delete?" dialog
  // should never be the thing that deletes.
  const cancelRef = useRef(null);

  const onDelete = () => {
    // Out of the draft only: Cancel brings it back, Save makes it final.
    dispatch({ type: "collections/draftRemoveItem", groupId, itemId });
    onClose();
  };

  return (
    <Modal
      title="Remove this link?"
      size="sm"
      isOpen={isOpen}
      onClose={onClose}
      initialFocus={cancelRef}
    >
      {/* Showing the card being deleted removes the guesswork about which
          link the confirmation refers to. */}
      <div className={classNames(ROW_CLASS, "shadow-card")}>
        <ItemRowSummary
          data={data}
          wideThumbnail={Boolean(safeHref(data?.imageUrl))}
        />
      </div>
      <p className="mt-3 text-sm leading-5 text-fg-muted">It’s removed from the collection when you save your changes.</p>
      <ModalActions>
        <Button ref={cancelRef} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Remove link
        </Button>
      </ModalActions>
    </Modal>
  );
}
