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

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ItemCard from "../Items/ItemCard";
import { EditableItemRow } from "../Items/ItemControls";
import { ROW_LIST_CLASS } from "../Items/ItemRow";
import CreateItemModal from "../Items/CreateItemModal";
import DeleteCollectionConfirmationModal from "./DeleteCollectionConfirmationModal";
import ViewToggle from "./ViewToggle";
import NotFound from "../Layout/NotFound";
import Button from "../Utilities/Button";
import CopyLinkButton from "../Utilities/CopyLinkButton";
import StatusMessage from "../Utilities/StatusMessage";
import { fieldClass } from "../Utilities/TextInput";
import { classNames } from "../Utilities/Helpers";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  LinkIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from "../Utilities/SvgIcons";
import {
  useCanDelete,
  useCanEdit,
  useGroup,
  useGroupHasImages,
  useGroupStatus,
  useItemIds
} from "../../hooks/data";
import { useCollectionView } from "../../hooks/preferences";
import { useDocumentTitle } from "../../hooks/session";

// Drag-and-drop is a ~16 KB gzip chunk that only an owner in edit mode needs.
const SortableItemList = lazy(() => import("./SortableItemList"));

const PAGE_CLASS = "mx-auto w-full max-w-6xl";
const GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

// The list view is one rounded panel with hairlines between rows — the
// grouped-list look — rather than a stack of separate cards.
const LIST_CLASS =
  "divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card";

// .skeleton already pulses; animate-pulse is spelled out as well because the
// tests run without CSS and find the skeleton by that class name.
const BONE = "skeleton animate-pulse";

/**
 * The page's own shape — header, then cards or rows in the visitor's chosen
 * layout — so nothing jumps when it loads.
 */
function CollectionSkeleton({ view }) {
  return (
    <div className={PAGE_CLASS} aria-busy="true">
      <p className="sr-only" role="status">
        Loading collection…
      </p>
      <div aria-hidden="true">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0 flex-1">
            <div className={classNames(BONE, "h-9 w-4/5 max-w-md rounded-lg sm:h-10")} />
            <div className={classNames(BONE, "mt-2 h-5 w-48")} />
          </div>
          <div className={classNames(BONE, "h-9 w-[7.5rem] rounded-full sm:mt-0.5")} />
        </div>
        {view === "list" ? (
          <ul className={classNames(LIST_CLASS, "mt-8")}>
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <li key={key} className="flex items-center gap-3.5 px-4 py-3 sm:gap-4 sm:px-5">
                <div className={classNames(BONE, "h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-[122px]")} />
                <div className="min-w-0 flex-1">
                  <div className={classNames(BONE, "h-3 w-24")} />
                  <div className={classNames(BONE, "mt-2.5 h-4 w-3/5")} />
                  <div className={classNames(BONE, "mt-2.5 h-3.5 w-4/5")} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={classNames(GRID_CLASS, "mt-8")}>
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <li
                key={key}
                className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card"
              >
                <div className={classNames(BONE, "aspect-[1.91/1] rounded-none")} />
                <div className="p-4">
                  <div className="flex h-5 items-center">
                    <div className={classNames(BONE, "h-3 w-24")} />
                  </div>
                  <div className={classNames(BONE, "mt-2 h-4 w-4/5")} />
                  <div className={classNames(BONE, "mt-3 h-3.5 w-full")} />
                  <div className={classNames(BONE, "mt-2 h-3.5 w-2/3")} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ canEdit, onAdd }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline-strong bg-surface/60 px-6">
      <StatusMessage
        icon={LinkIcon}
        tone="accent"
        titleAs="h2"
        title="No links here yet"
        actions={
          canEdit && (
            <Button variant="primary" size="lg" onClick={onAdd}>
              <PlusIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              Add a link
            </Button>
          )
        }
      >
        {canEdit
          ? "Paste a link and GoList fills in its title, description and thumbnail."
          : "The owner hasn’t added any links yet."}
      </StatusMessage>
    </div>
  );
}

function TitleEditor({ title, onSave, onCancel }) {
  const [draft, setDraft] = useState(title);
  const inputRef = useRef(null);

  // Starts with the whole title selected: typing replaces it, and an arrow
  // key keeps it for a small fix.
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const trimmed = draft.trim();

  const onSubmit = (event) => {
    event.preventDefault();
    if (!trimmed) return;
    // An unchanged title is not worth a write (or a "Title updated" toast).
    if (trimmed === title.trim()) {
      onCancel();
      return;
    }
    onSave(draft);
  };

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={onSubmit}
    >
      <label htmlFor="collection-title" className="sr-only">
        Collection title
      </label>
      <input
        ref={inputRef}
        id="collection-title"
        type="text"
        value={draft}
        maxLength={200}
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        // fieldClass sets its own 16px/14px text, and which of two font-size
        // utilities wins depends on stylesheet order, not class order — so
        // the heading size is marked important. (It also stays above 16px,
        // so iOS does not zoom into the field.)
        className={classNames(
          fieldClass,
          "min-w-0 flex-1 !text-2xl font-semibold tracking-tight sm:!text-3xl"
        )}
      />
      <div className="flex shrink-0 items-center gap-2">
        <Button type="submit" variant="primary" disabled={!trimmed}>
          Save
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Two labels in one grid cell: the button keeps the wider one's width. */
function SwapLabel({ showSecond, first, second }) {
  return (
    <span className="grid">
      <span
        className={classNames("col-start-1 row-start-1", showSecond && "invisible")}
        aria-hidden={showSecond || undefined}
      >
        {first}
      </span>
      <span
        className={classNames("col-start-1 row-start-1", !showSecond && "invisible")}
        aria-hidden={!showSecond || undefined}
      >
        {second}
      </span>
    </span>
  );
}

function EditToolbar({
  itemCount,
  isRenaming,
  canDelete,
  renameButtonRef,
  onRename,
  onDelete
}) {
  const canReorder = itemCount > 1;
  const HintIcon = canReorder ? ArrowsUpDownIcon : CheckCircleIcon;

  return (
    <div className="mt-6 flex animate-fade-in flex-col gap-2 rounded-2xl border border-hairline bg-surface p-2 pl-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pl-4">
      <p className="flex min-w-0 items-start gap-2 py-1.5 text-[13px] leading-5 text-fg-muted">
        <HintIcon
          className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle"
          strokeWidth={2}
          aria-hidden="true"
        />
        {canReorder ? (
          <span>
            Drag to reorder — changes save automatically.
            <span className="sr-only">
              {" "}
              With a keyboard, focus a link’s handle and press Space to pick it
              up, move it with the arrow keys, then press Space again to drop
              it.
            </span>
          </span>
        ) : (
          <span>Changes save automatically.</span>
        )}
      </p>
      {/* Stacked on a phone, the ghost buttons' icons line up under the
          hint's icon. */}
      <div className="-ml-4 flex flex-wrap items-center gap-1 sm:ml-0">
        <Button
          ref={renameButtonRef}
          variant="ghost"
          onClick={onRename}
          disabled={isRenaming}
        >
          <PencilIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Rename
        </Button>
        {canDelete && (
          <Button variant="danger-ghost" onClick={onDelete}>
            <TrashIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Delete collection
          </Button>
        )}
      </div>
    </div>
  );
}

function CollectionPage({ id }) {
  const dispatch = useDispatch();

  const group = useGroup(id);
  const status = useGroupStatus(id);
  const itemIds = useItemIds(id);
  const canEdit = useCanEdit(id);
  const canDelete = useCanDelete(id);
  const hasImages = useGroupHasImages(id);
  const [view, setView] = useCollectionView();

  // Editing and the open dialog are separate state. They used to share one
  // `mode`, so opening "Add link" or "Delete" from edit mode silently left
  // it, and cancelling the dialog dropped the user out of editing.
  const [isEditing, setIsEditing] = useState(false);
  const [dialog, setDialog] = useState(null); // "add" | "delete" | null
  const [isRenaming, setIsRenaming] = useState(false);

  const renameButtonRef = useRef(null);
  const refocusRename = useRef(false);

  useDocumentTitle(group?.title ? `${group.title} · GoList` : null);

  // The title field unmounts on Save or Cancel; focus goes back to Rename
  // rather than falling to <body>, where a keyboard user would lose their
  // place.
  useEffect(() => {
    if (!isRenaming && refocusRename.current) {
      refocusRename.current = false;
      renameButtonRef.current?.focus();
    }
  }, [isRenaming]);

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
      <StatusMessage
        icon={ExclamationTriangleIcon}
        title="Couldn’t load this collection"
        actions={
          <Button
            variant="primary"
            size="lg"
            onClick={() => dispatch({ type: "collections/subscribe", groupId: id })}
          >
            <ArrowPathIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            Retry
          </Button>
        }
      >
        Check your connection and try again.
      </StatusMessage>
    );
  }

  // Distinguishing "still loading" from "loaded but empty" is what stops an
  // empty collection from showing a spinner forever, as it used to. A
  // collection already in the store (seen earlier this session) renders
  // straight away while the listener reconnects, instead of flashing the
  // skeleton on every back-navigation.
  if (!group) {
    return <CollectionSkeleton view={view} />;
  }

  // Losing edit rights mid-edit (signing out, say) ends editing too.
  const editing = canEdit && isEditing;
  const count = itemIds.length;
  const shareUrl = `${window.location.origin}/${id}`;
  // Edit mode has its own row layout, and an empty list has nothing to lay out.
  const showViewToggle = !editing && count > 0;

  const closeDialog = () => setDialog(null);
  const stopRenaming = () => {
    refocusRename.current = true;
    setIsRenaming(false);
  };

  return (
    <div className={PAGE_CLASS}>
      {/* Two columns at every width. From `sm` the title and actions share the
          top row, and the details and layout switch the one below. On a phone
          the title and actions take full rows, with the details and switch
          between them — the switch never has to squeeze in beside buttons. */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-2">
        <div className={classNames("col-span-2 min-w-0", !isRenaming && "sm:col-span-1")}>
          {isRenaming ? (
            <TitleEditor
              title={group.title}
              onSave={(title) => {
                dispatch({ type: "collections/rename", groupId: id, title });
                stopRenaming();
              }}
              onCancel={stopRenaming}
            />
          ) : (
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg [overflow-wrap:anywhere] sm:text-4xl">
              {group.title || "Untitled collection"}
            </h1>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 text-fg-muted">
          <span className="min-w-0 break-all font-mono">goli.st/{id}</span>
          <span className="text-fg-subtle" aria-hidden="true">
            ·
          </span>
          <span className="tabular-nums">
            {count} link{count === 1 ? "" : "s"}
          </span>
          {canEdit && group.ownerId === "PUBLIC" && (
            // Shared demo lists are editable by every visitor; say so
            // before someone assumes the edits are private.
            <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium leading-4 text-fg-muted">
              <GlobeAltIcon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              Anyone can edit
            </span>
          )}
        </div>

        {showViewToggle && (
          <ViewToggle value={view} onChange={setView} className="justify-self-end" />
        )}

        {!isRenaming && (
          <div className="col-span-2 mt-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:mt-0.5 sm:self-start sm:justify-self-end">
            <CopyLinkButton url={shareUrl} />
            {canEdit && (
              <>
                <Button onClick={() => setDialog("add")} className="max-sm:w-9 max-sm:px-0">
                  <PlusIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  <span className="max-sm:sr-only">Add link</span>
                </Button>
                <Button
                  variant={editing ? "primary" : "secondary"}
                  aria-pressed={editing}
                  onClick={() => setIsEditing(!editing)}
                >
                  {editing ? (
                    <CheckIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <PencilSquareIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  )}
                  <SwapLabel showSecond={editing} first="Edit" second="Done" />
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      {editing && (
        <EditToolbar
          itemCount={count}
          isRenaming={isRenaming}
          canDelete={canDelete}
          renameButtonRef={renameButtonRef}
          onRename={() => setIsRenaming(true)}
          onDelete={() => setDialog("delete")}
        />
      )}

      <div className={editing ? "mt-4" : "mt-8"}>
        {count === 0 ? (
          <EmptyState canEdit={canEdit} onAdd={() => setDialog("add")} />
        ) : editing ? (
          <Suspense
            fallback={
              // The same rows with inert handles, so the list stays usable
              // while the chunk loads and nothing moves when it arrives.
              <ul className={ROW_LIST_CLASS}>
                {itemIds.map((itemId) => (
                  <li key={itemId}>
                    <EditableItemRow
                      id={itemId}
                      groupId={id}
                      wideThumbnail={hasImages}
                    />
                  </li>
                ))}
              </ul>
            }
          >
            <SortableItemList
              groupId={id}
              itemIds={itemIds}
              wideThumbnails={hasImages}
            />
          </Suspense>
        ) : view === "list" ? (
          // Keyed by layout so switching replays the fade instead of snapping.
          <ul key="list" className={classNames(LIST_CLASS, "animate-fade-in")}>
            {itemIds.map((itemId, index) => (
              <li key={itemId}>
                <ItemCard
                  id={itemId}
                  layout="row"
                  wideThumbnail={hasImages}
                  // Rows are short; the first several are what a visitor
                  // sees on arrival.
                  priority={index < 4}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul key="grid" className={classNames(GRID_CLASS, "animate-fade-in")}>
            {itemIds.map((itemId, index) => (
              <li key={itemId} className="min-w-0">
                <ItemCard
                  id={itemId}
                  layout={hasImages ? "media" : "compact"}
                  // Roughly the first row: what a visitor sees on arrival.
                  priority={index < 3}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {!canEdit && (
        // Every shared list is a visitor's first look at GoList.
        <p className="mt-12 text-center">
          <Link
            to="/"
            className="group inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            Make your own list on GoList
            <ArrowRightIcon
              className="h-3.5 w-3.5 transition-transform duration-200 ease-smooth motion-safe:group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </p>
      )}

      {canEdit && (
        <CreateItemModal groupId={id} isOpen={dialog === "add"} onClose={closeDialog} />
      )}
      {canDelete && (
        <DeleteCollectionConfirmationModal
          groupId={id}
          isOpen={dialog === "delete"}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

export default function CollectionView() {
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    // A live listener, torn down on navigate — so a collection edited in
    // another tab or by a collaborator updates in place.
    dispatch({ type: "collections/subscribe", groupId: id });
    return () => dispatch({ type: "collections/unsubscribe", groupId: id });
  }, [dispatch, id]);

  // Keyed by id: the router reuses this element from one collection to the
  // next, and edit mode or an open dialog must not carry across.
  return <CollectionPage key={id} id={id} />;
}
