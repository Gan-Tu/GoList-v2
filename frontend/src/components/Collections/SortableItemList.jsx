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

import { useDispatch } from "react-redux";
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
import { CARD_CLASS, ItemControls } from "../Items/ItemCard";
import ItemSnippet from "../Items/ItemSnippet";
import { ArrowsUpDownIcon } from "../Utilities/SvgIcons";

function SortableCard({ id, groupId }) {
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
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${CARD_CLASS} ${isDragging ? "opacity-60 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Only the handle starts a drag, so the Edit and Delete buttons stay
            clickable. dnd-kit's attributes also make it keyboard-operable. */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 active:cursor-grabbing"
        >
          <span className="sr-only">Reorder this link</span>
          <ArrowsUpDownIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <ItemSnippet id={id} />
          <ItemControls id={id} groupId={groupId} />
        </div>
      </div>
    </div>
  );
}

export default function SortableItemList({ groupId, itemIds }) {
  const dispatch = useDispatch();

  const sensors = useSensors(
    // A small activation distance keeps a click on the card from being
    // swallowed as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
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
    <>
      <p className="mb-3 text-sm text-gray-500">
        Drag a card, or focus a handle and use the arrow keys, to reorder.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-4">
            {itemIds.map((itemId) => (
              <li key={itemId}>
                <SortableCard id={itemId} groupId={groupId} />
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
