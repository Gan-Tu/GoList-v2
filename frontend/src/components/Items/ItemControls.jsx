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

import { forwardRef, useCallback, useId, useRef, useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ItemEditForm from "./ItemEditForm";
import { ItemRowSummary, ROW_CLASS } from "./ItemRow";
import { itemLabel, itemStatus } from "./ItemSnippet";
import Button from "../Utilities/Button";
import Modal from "../Utilities/Modal";
import { classNames } from "../Utilities/Helpers";
import { GripVerticalIcon, PencilIcon, TrashIcon } from "../Utilities/SvgIcons";
import { useItemData, useItemIsSaving } from "../../hooks/data";

// This module is everything edit mode needs per link except drag-and-drop,
// which stays in the lazily-loaded SortableItemList. The static rows shown
// while that chunk downloads come from here too, so they match exactly.

/**
 * The trailing Edit / Delete buttons of an edit-mode row, and their dialogs.
 * `describedBy` points at the row's title so "Edit link" is not one of a
 * dozen identical buttons to a screen reader.
 */
export function ItemControls({ id, groupId, describedBy }) {
  const [dialog, setDialog] = useState(null);
  const firstFieldRef = useRef(null);
  const close = useCallback(() => setDialog(null), []);

  return (
    <>
      <Modal
        title="Edit link"
        size="lg"
        isOpen={dialog === "edit"}
        onClose={close}
        initialFocus={firstFieldRef}
      >
        <ItemEditForm
          itemId={id}
          groupId={groupId}
          firstFieldRef={firstFieldRef}
          // Closing on an explicit save result, rather than the old 1-second
          // timer that fired whether or not the write had landed.
          onSaved={close}
          onCancel={close}
        />
      </Modal>
      <DeleteConfirmationModal
        itemId={id}
        groupId={groupId}
        isOpen={dialog === "delete"}
        onClose={close}
      />

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          iconOnly
          title="Edit link"
          aria-describedby={describedBy}
          onClick={() => setDialog("edit")}
        >
          <span className="sr-only">Edit link</span>
          <PencilIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Button>
        <Button
          variant="danger-ghost"
          iconOnly
          title="Delete link"
          aria-describedby={describedBy}
          onClick={() => setDialog("delete")}
        >
          <span className="sr-only">Delete link</span>
          <TrashIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}

// 32 × 40: a comfortable grab target that still leaves the title room on a
// 320px phone.
const HANDLE_CLASS =
  "grid h-10 w-8 shrink-0 place-items-center rounded-lg text-fg-subtle";

/**
 * One link in edit mode: drag handle, thumbnail, title and site, then Edit and
 * Delete.
 *
 * Without `handleProps` the handle is an inert stand-in of the same size —
 * that is how the list renders while the drag-and-drop chunk loads, so
 * nothing moves when the real handles arrive. SortableItemList passes the
 * row ref, transform style and handle wiring through.
 */
export const EditableItemRow = forwardRef(function EditableItemRow(
  {
    id,
    groupId,
    wideThumbnail = false,
    isDragging = false,
    style,
    handleRef,
    handleProps
  },
  ref
) {
  const data = useItemData(id);
  const isSaving = useItemIsSaving(id);
  const titleId = useId();

  return (
    <div
      ref={ref}
      style={style}
      className={classNames(
        ROW_CLASS,
        // Lifted while dragging: above its neighbours, with a deeper shadow
        // and an accent edge so it reads as "in hand".
        isDragging
          ? "relative z-10 shadow-popover ring-1 ring-accent/30"
          : "shadow-card"
      )}
    >
      {handleProps ? (
        // Only the handle starts a drag, so the buttons stay clickable and
        // the rest of the row still scrolls the page on touch.
        <button
          type="button"
          ref={handleRef}
          {...handleProps}
          className={classNames(
            HANDLE_CLASS,
            "cursor-grab touch-none transition-colors hover:bg-subtle hover:text-fg active:cursor-grabbing"
          )}
        >
          <span className="sr-only">Reorder {itemLabel(data)}</span>
          <GripVerticalIcon className="h-4 w-4" />
        </button>
      ) : (
        <div className={HANDLE_CLASS} aria-hidden="true">
          <GripVerticalIcon className="h-4 w-4" />
        </div>
      )}

      <ItemRowSummary
        data={data}
        status={itemStatus(data, isSaving)}
        wideThumbnail={wideThumbnail}
        // On the narrowest phones the title needs the width more.
        thumbnailClassName="hidden min-[360px]:block"
        titleId={titleId}
      />

      <ItemControls id={id} groupId={groupId} describedBy={titleId} />
    </div>
  );
});
