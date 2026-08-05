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

import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import collections from "../../state/redux/DataGroups/reducer";
import session from "../../state/redux/Session/reducer";
import CollectionView from "./CollectionView";

const GROUP = "my-list";

// A store with reducers but no saga middleware: the view can be exercised
// without booting Firebase, which would otherwise try to open a real
// connection from jsdom.
function renderView(preloadedState) {
  const store = configureStore({
    reducer: { collections, session },
    preloadedState,
    middleware: (getDefault) => getDefault({ serializableCheck: false })
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/${GROUP}`]}>
        <Routes>
          <Route path="/:id" element={<CollectionView />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function baseState(overrides = {}) {
  return {
    collections: {
      groups: {},
      items: {},
      groupStatus: {},
      creating: {},
      savingItems: {},
      lastCreatedId: null,
      ...overrides
    },
    session: {
      user: null,
      authResolved: true,
      domains: [],
      domainsStatus: "idle",
      emailForSignIn: null,
      emailVerification: "idle"
    }
  };
}

describe("CollectionView states", () => {
  it("shows a skeleton while loading", () => {
    const { container } = renderView(
      baseState({ groupStatus: { [GROUP]: "loading" } })
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  // The regression this guards: an empty collection used to fall into the same
  // branch as "loading" and spun forever, because the only check was
  // `if (!itemIds?.length) return <Loading/>`.
  it("shows an empty state, not a spinner, for a loaded empty collection", () => {
    const { container } = renderView(
      baseState({
        groups: {
          [GROUP]: { id: GROUP, title: "Empty", ownerId: "alice", itemIds: [] }
        },
        groupStatus: { [GROUP]: "ready" }
      })
    );

    expect(screen.getByText("No links here yet")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("shows a not-found page for a missing collection", () => {
    renderView(baseState({ groupStatus: { [GROUP]: "notFound" } }));
    expect(screen.getByText("No collection at this address")).toBeInTheDocument();
    expect(screen.getByText(/goli\.st\/my-list/)).toBeInTheDocument();
  });

  it("offers a retry on error rather than failing silently", () => {
    renderView(baseState({ groupStatus: { [GROUP]: "error" } }));
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders items and the link count when ready", () => {
    renderView(
      baseState({
        groups: {
          [GROUP]: {
            id: GROUP,
            title: "Reading",
            ownerId: "alice",
            itemIds: ["a", "b"]
          }
        },
        items: {
          a: { id: "a", title: "First", link: "https://one.example.com" },
          b: { id: "b", title: "Second", link: "https://two.example.com" }
        },
        groupStatus: { [GROUP]: "ready" }
      })
    );

    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("2 links")).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});

describe("edit affordances", () => {
  const ready = (ownerId, user) => ({
    ...baseState({
      groups: {
        [GROUP]: { id: GROUP, title: "Reading", ownerId, itemIds: [] }
      },
      groupStatus: { [GROUP]: "ready" }
    }),
    session: {
      user,
      authResolved: true,
      domains: [],
      domainsStatus: "idle",
      emailForSignIn: null,
      emailVerification: "idle"
    }
  });

  it("hides editing from a visitor who does not own the collection", () => {
    renderView(ready("alice", { uid: "bob", isAnonymous: false }));
    expect(screen.queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument();
  });

  it("offers editing to the owner", () => {
    renderView(ready("alice", { uid: "alice", isAnonymous: false }));
    expect(screen.getByRole("button", { name: /Edit/ })).toBeInTheDocument();
  });

  it("offers editing on a shared PUBLIC collection", () => {
    renderView(ready("PUBLIC", { uid: "bob", isAnonymous: false }));
    expect(screen.getByRole("button", { name: /Edit/ })).toBeInTheDocument();
  });

  it("always offers the share link", () => {
    renderView(ready("alice", null));
    expect(
      screen.getByRole("button", { name: /Copy link/ })
    ).toBeInTheDocument();
  });
});
