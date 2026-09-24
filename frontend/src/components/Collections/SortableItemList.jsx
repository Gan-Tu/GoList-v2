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

// Everything drag-and-drop lives in this module so that @dnd-kit lands in its
// own lazily-loaded chunk. Most visits to a collection are read-only, and
// reordering is only reachable behind the owner's "Edit" button — there is no
// reason for a reader to download the drag machinery.

import { useEffect, useMemo } from "react";
import { useDispatch, useStore } from "react-redux";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditableItemRow } from "../Items/ItemControls";
import { ROW_LIST_CLASS } from "../Items/ItemRow";
import { itemLabel } from "../Items/ItemSnippet";

// The list is one column, so a row only ever needs to move up or down; this
// keeps it from sliding sideways under a wandering pointer.
function restrictToVerticalAxis({ transform }) {
  return { ...transform, x: 0 };
}

// dnd-kit's defaults announce raw item ids — UUIDs, here — and describe space
// bar only. These name the link and its position instead.
const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "To reorder, press Space or Enter to pick up this link, move it with the " +
    "up and down arrow keys, then press Space or Enter again to drop it. " +
    "Press Escape to cancel."
};

function setBodyCursor(cursor) {
  // While a row is in hand the pointer often leaves its handle; the grabbing
  // cursor should follow it rather than flicker back to an arrow.
  document.body.style.cursor = cursor;
}

function SortableRow({ id, groupId, wideThumbnail }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  return (
    <li>
      <EditableItemRow
        ref={setNodeRef}
        id={id}
        groupId={groupId}
        wideThumbnail={wideThumbnail}
        isDragging={isDragging}
        // Translate, not Transform: rows are all the same size, and the scale
        // component dnd-kit adds for mismatched sizes would only distort one.
        style={{ transform: CSS.Translate.toString(transform), transition }}
        handleRef={setActivatorNodeRef}
        // dnd-kit's attributes also make the handle keyboard-operable.
        handleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
}

export default function SortableItemList({ groupId, itemIds, wideThumbnails }) {
  const dispatch = useDispatch();
  const store = useStore();

  const sensors = useSensors(
    // A small activation distance keeps a click on the handle from being
    // swallowed as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Leaving edit mode mid-drag must not strand the grabbing cursor.
  useEffect(() => () => setBodyCursor(""), []);

  const accessibility = useMemo(() => {
    // Read at announcement time rather than subscribed to, so the list does
    // not re-render whenever any item's metadata changes.
    const nameOf = (id) => itemLabel(store.getState().collections.items[id]);
    const positionOf = (id) =>
      `position ${itemIds.indexOf(id) + 1} of ${itemIds.length}`;
    // dnd-kit reports the row as over its own slot the moment it is picked
    // up; announcing that would talk over "Picked up…" with a non-move.
    // (Returning undefined leaves the current announcement in place.)
    let lastOverId = null;

    return {
      screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
      announcements: {
        onDragStart: ({ active }) => {
          lastOverId = active.id;
          return `Picked up ${nameOf(active.id)}, ${positionOf(active.id)}.`;
        },
        onDragOver: ({ active, over }) => {
          if ((over?.id ?? null) === lastOverId) return undefined;
          lastOverId = over?.id ?? null;
          return over
            ? `${nameOf(active.id)} moved to ${positionOf(over.id)}.`
            : `${nameOf(active.id)} is outside the list.`;
        },
        onDragEnd: ({ active, over }) =>
          over
            ? `${nameOf(active.id)} dropped at ${positionOf(over.id)}.`
            : `${nameOf(active.id)} dropped.`,
        onDragCancel: ({ active }) =>
          `Reordering cancelled. ${nameOf(active.id)} is back at ${positionOf(active.id)}.`
      }
    };
  }, [store, itemIds]);

  const onDragEnd = ({ active, over }) => {
    setBodyCursor("");
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    dispatch({
      type: "collections/reorder",
      groupId,
      itemIds: arrayMove(itemIds, oldIndex, newIndex)
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={accessibility}
      onDragStart={() => setBodyCursor("grabbing")}
      onDragEnd={onDragEnd}
      onDragCancel={() => setBodyCursor("")}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ul className={ROW_LIST_CLASS}>
          {itemIds.map((itemId) => (
            <SortableRow
              key={itemId}
              id={itemId}
              groupId={groupId}
              wideThumbnail={wideThumbnails}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
