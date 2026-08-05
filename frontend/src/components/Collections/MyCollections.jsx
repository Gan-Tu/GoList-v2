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
import { Spinner } from "../Utilities/SvgIcons";
import { useMyCollections, useMyCollectionsStatus } from "../../hooks/data";
import {
  useAuthResolved,
  useDocumentTitle,
  useLoggedInUserId
} from "../../hooks/session";

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
  // does not see "you have no lists" flash before their lists arrive.
  if (!authResolved || status === "loading") {
    return (
      <div
        className="flex items-center gap-2 py-16 text-gray-500"
        role="status"
      >
        <Spinner className="h-5 w-5" />
        <span>Loading your lists…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Couldn’t load your lists
        </h1>
        <button
          type="button"
          onClick={() => dispatch({ type: "session/fetchDomains", uid })}
          className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="w-full max-w-md py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900">No lists yet</h1>
        <p className="mt-2 text-gray-600">
          Collections you create will show up here.
        </p>
        <div className="mt-8">
          <CreateCollectionModal />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
        <div className="w-full sm:w-auto">
          <CreateCollectionModal />
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.id}>
            {/* A router Link keeps navigation inside the SPA; these were
                <a href> and reloaded the entire app on every click. */}
            <Link
              to={collection.destination}
              className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <h2 className="truncate text-sm font-medium text-gray-900">
                {collection.title || "Untitled collection"}
              </h2>
              <p className="mt-1 truncate text-xs text-gray-500">
                {collection.url}
              </p>
              {collection.ownerId === "PUBLIC" && (
                <span className="mt-3 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  Shared
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
