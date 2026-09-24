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

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import { fieldClasses, labelClass } from "../Utilities/TextInput";
import { classNames } from "../Utilities/Helpers";
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
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setConfirmation("");
  }, [isOpen]);

  // Deleting a collection destroys its short URL along with every link in it,
  // and nothing here is recoverable — so this one asks the user to type the id
  // rather than accepting a single mis-aimed click.
  const canDelete = confirmation.trim() === groupId;

  const onDelete = (event) => {
    event.preventDefault();
    if (!canDelete) return;
    dispatch({ type: "collections/delete", groupId });
    onClose();
    navigate("/");
  };

  return (
    <Modal
      title="Delete this collection?"
      size="sm"
      isOpen={isOpen}
      onClose={onClose}
      initialFocus={inputRef}
    >
      <form onSubmit={onDelete}>
        <p className="text-sm leading-6 text-fg-muted [overflow-wrap:anywhere]">
          <span className="font-medium text-fg">{group?.title}</span> and its{" "}
          <span className="tabular-nums">{itemIds.length}</span> link
          {itemIds.length === 1 ? "" : "s"} will be permanently deleted, and{" "}
          <span className="font-medium text-fg">goli.st/{groupId}</span> will
          stop working.
        </p>

        <label htmlFor="delete-confirmation" className={classNames(labelClass, "mt-5")}>
          Type <span className="font-mono">{groupId}</span> to confirm
        </label>
        <input
          ref={inputRef}
          id="delete-confirmation"
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={groupId}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={classNames(
            // The same field, but its focus ring is the color of what the
            // button below will do.
            fieldClasses({ tone: "danger" }),
            "mt-1.5 font-mono"
          )}
        />

        <ModalActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={!canDelete}>
            Delete collection
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
