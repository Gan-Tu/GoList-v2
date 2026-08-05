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

import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import ItemCard from "../Items/ItemCard";
import CreateItemModal from "../Items/CreateItemModal";
import DeleteCollectionConfirmationModal from "./DeleteCollectionConfirmationModal";
import NotFound from "../Layout/NotFound";
import CopyLinkButton from "../Utilities/CopyLinkButton";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  TrashIcon
} from "../Utilities/SvgIcons";

// Drag-and-drop is a ~12 KB gzip chunk that only an owner in edit mode needs.
const SortableItemList = lazy(() => import("./SortableItemList"));
import {
  useCanEdit,
  useGroup,
  useGroupStatus,
  useItemIds
} from "../../hooks/data";
import { useDocumentTitle } from "../../hooks/session";

function CollectionSkeleton() {
  return (
    <div className="w-full max-w-4xl animate-pulse" aria-hidden="true">
      <div className="h-8 w-52 rounded bg-gray-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-24 rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-full rounded bg-gray-100" />
            <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ canEdit, onAdd }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
      <p className="text-gray-900 font-medium">No links here yet</p>
      <p className="mt-1 text-sm text-gray-500">
        {canEdit
          ? "Add the first link to this collection."
          : "The owner hasn’t added any links yet."}
      </p>
      {canEdit && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <PlusCircleIcon className="w-4 h-4" aria-hidden="true" />
          Add a link
        </button>
      )}
    </div>
  );
}

function TitleEditor({ title, onSave, onCancel }) {
  const [draft, setDraft] = useState(title);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <label htmlFor="collection-title" className="sr-only">
        Collection title
      </label>
      <input
        id="collection-title"
        type="text"
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
        className="rounded-md border border-gray-300 px-2 py-1 text-xl font-bold text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        <CheckIcon className="w-4 h-4" aria-hidden="true" />
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        Cancel
      </button>
    </form>
  );
}

export default function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const group = useGroup(id);
  const status = useGroupStatus(id);
  const itemIds = useItemIds(id);
  const canEdit = useCanEdit(id);

  const [mode, setMode] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);

  useDocumentTitle(group?.title ? `${group.title} · GoList` : null);

  useEffect(() => {
    // A live listener, torn down on navigate — so a collection edited in
    // another tab or by a collaborator updates in place.
    dispatch({ type: "collections/subscribe", groupId: id });
    return () => dispatch({ type: "collections/unsubscribe", groupId: id });
  }, [dispatch, id]);

  if (status === "notFound") {
    return (
      <NotFound
        title="No collection at this address"
        message={`Nothing has been published at goli.st/${id}.`}
      />
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md text-center py-12">
        <ExclamationTriangleIcon
          className="mx-auto w-10 h-10 text-amber-500"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Couldn’t load this collection
        </h1>
        <p className="mt-2 text-gray-600">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: "collections/subscribe", groupId: id })
          }
          className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Distinguishing "still loading" from "loaded but empty" is what stops an
  // empty collection from showing a spinner forever, as it used to.
  if (!group || status === "loading" || status === undefined) {
    return <CollectionSkeleton />;
  }

  const isEditing = mode === "edit";
  const shareUrl = `${window.location.origin}/${id}`;

  return (
    <div className="w-full max-w-4xl">
      <CreateItemModal
        groupId={id}
        isOpen={mode === "create"}
        onClose={() => setMode(null)}
      />
      <DeleteCollectionConfirmationModal
        groupId={id}
        isOpen={mode === "delete"}
        onClose={() => setMode(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {isRenaming ? (
          <TitleEditor
            title={group.title}
            onSave={(title) => {
              dispatch({ type: "collections/rename", groupId: id, title });
              setIsRenaming(false);
            }}
            onCancel={() => setIsRenaming(false)}
          />
        ) : (
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {group.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {itemIds.length} link{itemIds.length === 1 ? "" : "s"}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <CopyLinkButton url={shareUrl} />

          {canEdit && !isRenaming && (
            <>
              <button
                type="button"
                onClick={() => setMode(isEditing ? null : "edit")}
                aria-pressed={isEditing}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                  isEditing
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <AdjustmentsHorizontalIcon
                  className="w-4 h-4"
                  aria-hidden="true"
                />
                {isEditing ? "Done" : "Edit"}
              </button>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRenaming(true)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("create")}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="sr-only">Add a link</span>
                    <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("delete")}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-red-600 hover:bg-red-50"
                  >
                    <span className="sr-only">Delete this collection</span>
                    <TrashIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        {itemIds.length === 0 ? (
          <EmptyState canEdit={canEdit} onAdd={() => setMode("create")} />
        ) : isEditing ? (
          <Suspense
            fallback={
              // Falls back to the same cards without drag handles, so the list
              // stays readable while the chunk loads instead of blanking out.
              <ul className="grid gap-4">
                {itemIds.map((itemId) => (
                  <li key={itemId}>
                    <ItemCard id={itemId} groupId={id} showControls />
                  </li>
                ))}
              </ul>
            }
          >
            <SortableItemList groupId={id} itemIds={itemIds} />
          </Suspense>
        ) : (
          <ul
            className={`grid gap-4 ${
              itemIds.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-3" : ""
            }`}
          >
            {itemIds.map((itemId) => (
              <li key={itemId}>
                <ItemCard id={itemId} groupId={id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
