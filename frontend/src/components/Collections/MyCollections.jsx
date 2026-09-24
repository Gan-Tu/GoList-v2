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

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import CreateCollectionModal from "./CreateCollectionModal";
import Button from "../Utilities/Button";
import Monogram from "../Utilities/Monogram";
import StatusMessage from "../Utilities/StatusMessage";
import { classNames } from "../Utilities/Helpers";
import {
  ArrowPathIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  RectangleStackIcon
} from "../Utilities/SvgIcons";
import { useMyCollections, useMyCollectionsStatus } from "../../hooks/data";
import {
  useAuthResolved,
  useDocumentTitle,
  useLoggedInUserId
} from "../../hooks/session";

// grid-cols-1 even on a phone: an implicit column is sized to its content, so
// one long title would stretch it past the screen instead of truncating.
const GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";

// Shared by the real cards and their skeletons, so nothing moves when the
// lists arrive.
const CARD_CLASS =
  "flex items-center gap-3.5 rounded-2xl bg-surface p-4 shadow-card ring-1 ring-hairline";

export default function MyCollections() {
  const dispatch = useDispatch();
  const uid = useLoggedInUserId();
  const authResolved = useAuthResolved();
  const collections = useMyCollections();
  const status = useMyCollectionsStatus();

  useDocumentTitle("My Lists · GoList");

  useEffect(() => {
    if (!authResolved) return;
    dispatch({ type: "session/fetchDomains", uid });
  }, [dispatch, uid, authResolved]);

  // Waiting for Firebase to restore the session first, so a signed-in user
  // does not see "you have no lists" flash before their lists arrive. "idle"
  // counts too: it is the one render between auth resolving and the fetch
  // above being dispatched.
  const isLoading = !authResolved || status === "loading" || status === "idle";
  const isError = !isLoading && status === "error";
  const isEmpty = !isLoading && !isError && collections.length === 0;
  const sharedCount = collections.filter(
    (collection) => collection.ownerId === "PUBLIC"
  ).length;

  const retry = () => dispatch({ type: "session/fetchDomains", uid });

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            My Lists
          </h1>
          {/* Fixed height, so the line can switch from placeholder to count
              without nudging the grid. */}
          {!isError && !isEmpty && (
            <div className="mt-1 flex h-6 items-center text-[15px] tabular-nums text-fg-muted">
              {isLoading ? (
                <span className="skeleton h-4 w-28" aria-hidden="true" />
              ) : (
                <p>
                  {collections.length}{" "}
                  {collections.length === 1 ? "list" : "lists"}
                  {sharedCount > 0 && ` · ${sharedCount} shared`}
                </p>
              )}
            </div>
          )}
        </div>
        {/* The empty state carries its own button instead. */}
        {!isEmpty && (
          <CreateCollectionModal
            label="New collection"
            icon={PlusIcon}
            size="lg"
            className="w-full sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
          />
        )}
      </header>

      <div className="mt-8">
        {isLoading ? (
          <LoadingGrid />
        ) : isError ? (
          <StatusMessage
            icon={ExclamationTriangleIcon}
            tone="danger"
            title="Couldn’t load your lists"
            titleAs="h2"
            actions={
              <Button onClick={retry}>
                <ArrowPathIcon
                  className="h-4 w-4"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Retry
              </Button>
            }
          >
            Check your connection and try again.
          </StatusMessage>
        ) : isEmpty ? (
          <StatusMessage
            icon={RectangleStackIcon}
            tone="accent"
            title="No lists yet"
            titleAs="h2"
            actions={<CreateCollectionModal icon={PlusIcon} size="lg" />}
          >
            Collections you create will show up here.
          </StatusMessage>
        ) : (
          <ul className={classNames(GRID_CLASS, "animate-fade-in")}>
            {collections.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CollectionCard({ collection }) {
  const title = collection.title?.trim();

  return (
    // A router Link keeps navigation inside the SPA; these were <a href> and
    // reloaded the entire app on every click.
    <Link
      to={collection.destination}
      className={classNames(
        "group",
        CARD_CLASS,
        "transition duration-200 ease-smooth hover:shadow-card-hover",
        "active:scale-[0.99] motion-safe:hover:-translate-y-0.5"
      )}
    >
      <Monogram
        seed={collection.id}
        label={title || collection.id}
        className="h-11 w-11 shrink-0 rounded-xl"
        letterClassName="text-lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2
            className={classNames(
              "truncate text-[15px] font-semibold leading-snug",
              title ? "text-fg" : "text-fg-muted"
            )}
          >
            {title || "Untitled collection"}
          </h2>
          {collection.ownerId === "PUBLIC" && (
            <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-fg-muted">
              Shared
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-[13px] text-fg-muted">
          {collection.url}
        </p>
      </div>
      <ChevronRightIcon
        className="h-4 w-4 shrink-0 text-fg-subtle transition-[color,transform] duration-200 ease-smooth group-hover:text-fg motion-safe:group-hover:translate-x-0.5"
        strokeWidth={2}
        aria-hidden="true"
      />
    </Link>
  );
}

/** Six placeholder cards in the real grid, instead of a spinner on its own. */
function LoadingGrid() {
  return (
    <div role="status">
      <span className="sr-only">Loading your lists…</span>
      <ul className={GRID_CLASS} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className={CARD_CLASS}>
            <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex h-[21px] items-center">
                <div className="skeleton h-3.5 w-3/5" />
              </div>
              <div className="mt-0.5 flex h-5 items-center">
                <div className="skeleton h-3 w-2/5" />
              </div>
            </div>
            <div className="h-4 w-4 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
