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
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import collections from "../../state/redux/DataGroups/reducer";
import session from "../../state/redux/Session/reducer";
import CollectionView from "./CollectionView";

const GROUP = "my-list";

// A store with reducers but no saga middleware: the view can be exercised
// without booting Firebase, which would otherwise try to open a real
// connection from jsdom. Dispatched actions are recorded, so a test can check
// what a save would have sent without running the saga.
function renderView(preloadedState) {
  const actions = [];
  const record = () => (next) => (action) => {
    actions.push(action);
    return next(action);
  };
  const store = configureStore({
    reducer: { collections, session },
    preloadedState,
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(record)
  });

  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/${GROUP}`]}>
        <Routes>
          <Route path="/:id" element={<CollectionView />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return { ...utils, store, actions };
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
      drafts: {},
      savingDrafts: {},
      suggestions: {},
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

  // Coming back to a collection re-subscribes, which marks it "loading" again;
  // the copy already in the store should show instead of a skeleton flash.
  it("shows a collection already in the store while it reconnects", () => {
    const { container } = renderView(
      baseState({
        groups: {
          [GROUP]: { id: GROUP, title: "Seen before", ownerId: "alice", itemIds: [] }
        },
        groupStatus: { [GROUP]: "loading" }
      })
    );

    expect(screen.getByRole("heading", { name: "Seen before" })).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
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

  // A card is one big link; its name should be the title, not every word on
  // the card read out in one breath.
  it("names each card by its title and says it opens a new tab", () => {
    renderView(
      baseState({
        groups: {
          [GROUP]: { id: GROUP, title: "Reading", ownerId: "alice", itemIds: ["a"] }
        },
        items: {
          a: { id: "a", title: "First", link: "https://one.example.com" }
        },
        groupStatus: { [GROUP]: "ready" }
      })
    );

    expect(
      screen.getByRole("link", { name: "First (opens in a new tab)" })
    ).toHaveAttribute("href", "https://one.example.com/");
  });

  it("never turns a stored javascript: URL into a link", () => {
    renderView(
      baseState({
        groups: {
          [GROUP]: { id: GROUP, title: "Reading", ownerId: "alice", itemIds: ["a"] }
        },
        items: {
          a: { id: "a", title: "Sneaky", link: "javascript:alert(1)" }
        },
        groupStatus: { [GROUP]: "ready" }
      })
    );

    expect(screen.getByText("Sneaky")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Sneaky/ })
    ).not.toBeInTheDocument();
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

  it("points a read-only visitor at making a list of their own", () => {
    renderView(ready("alice", { uid: "bob", isAnonymous: false }));
    expect(
      screen.getByRole("link", { name: /Make your own list/ })
    ).toHaveAttribute("href", "/");
  });

  // The regression this guards: edit mode and the open dialog used to share
  // one piece of state, so opening "Add link" while editing left edit mode,
  // and cancelling the dialog dropped the user back to the read-only view.
  it("stays in edit mode when the Add link dialog is cancelled", async () => {
    const user = userEvent.setup();
    renderView(ready("alice", { uid: "alice", isAnonymous: false }));

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add link" }));
    const dialog = await screen.findByRole("dialog", { name: "Add a link" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rename" })).toBeInTheDocument();
  });

  // Firestore rules let anyone edit a shared PUBLIC list but only its owner
  // delete one, so the button is not offered where it can only fail.
  it("offers deleting the collection only to its owner", async () => {
    const user = userEvent.setup();
    const { unmount } = renderView(
      ready("PUBLIC", { uid: "bob", isAnonymous: false })
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.queryByRole("button", { name: "Delete collection" })
    ).not.toBeInTheDocument();
    unmount();

    renderView(ready("alice", { uid: "alice", isAnonymous: false }));
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByRole("button", { name: "Delete collection" })
    ).toBeInTheDocument();
  });
});

describe("layout", () => {
  const withLinks = (ownerId, user, itemIds = ["a", "b"]) => ({
    ...baseState({
      groups: {
        [GROUP]: { id: GROUP, title: "Reading", ownerId, itemIds }
      },
      items: {
        a: { id: "a", title: "First", link: "https://one.example.com" },
        b: { id: "b", title: "Second", link: "https://two.example.com" }
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

  it("starts as a list and remembers a switch to the gallery", async () => {
    const user = userEvent.setup();
    const { unmount } = renderView(withLinks("alice", null));

    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    // Rows are one link each, named by title, like the cards.
    expect(
      screen.getByRole("link", { name: "First (opens in a new tab)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Gallery view" }));
    expect(screen.getByRole("button", { name: "Gallery view" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("link", { name: "First (opens in a new tab)" })
    ).toBeInTheDocument();
    unmount();

    renderView(withLinks("alice", null));
    expect(screen.getByRole("button", { name: "Gallery view" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  // Edit mode already lays links out as rows, and an empty collection has
  // nothing to arrange — a switch there would do nothing.
  it("hides the layout switch while editing and on an empty collection", async () => {
    const user = userEvent.setup();
    const { unmount } = renderView(
      withLinks("alice", { uid: "alice", isAnonymous: false })
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.queryByRole("button", { name: "List view" })
    ).not.toBeInTheDocument();
    unmount();

    renderView(withLinks("alice", null, []));
    expect(
      screen.queryByRole("button", { name: "List view" })
    ).not.toBeInTheDocument();
  });
});

describe("edit mode as a draft", () => {
  const owned = () => ({
    ...baseState({
      groups: {
        [GROUP]: { id: GROUP, title: "Reading", ownerId: "alice", itemIds: ["a", "b"] }
      },
      items: {
        a: { id: "a", order: 0, title: "First", link: "https://one.example.com", snippet: "", imageUrl: "" },
        b: { id: "b", order: 1, title: "Second", link: "https://two.example.com", snippet: "Two", imageUrl: "" }
      },
      groupStatus: { [GROUP]: "ready" }
    }),
    session: {
      user: { uid: "alice", isAnonymous: false },
      authResolved: true,
      domains: [],
      domainsStatus: "idle",
      emailForSignIn: null,
      emailVerification: "idle"
    }
  });

  async function renameTo(user, title) {
    await user.click(screen.getByRole("button", { name: "Rename" }));
    const field = screen.getByLabelText("Collection title");
    await user.clear(field);
    await user.type(field, `${title}{Enter}`);
  }

  it("throws every change away on Cancel, after asking", async () => {
    const user = userEvent.setup();
    const { actions } = renderView(owned());

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await renameTo(user, "Renamed");
    expect(screen.getByRole("heading", { level: 1, name: "Renamed" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    const dialog = await screen.findByRole("dialog", { name: "Discard your changes?" });
    await user.click(within(dialog).getByRole("button", { name: "Discard changes" }));

    expect(screen.getByRole("heading", { level: 1, name: "Reading" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    // Nothing was ever sent to be saved.
    expect(actions.some((action) => action.type === "collections/saveDraft")).toBe(false);
  });

  it("leaves without asking when nothing changed", async () => {
    const user = userEvent.setup();
    renderView(owned());

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("saves the staged changes in one go", async () => {
    const user = userEvent.setup();
    const { actions } = renderView(owned());

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await renameTo(user, "Renamed");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(actions.filter((action) => action.type === "collections/saveDraft")).toEqual([
      { type: "collections/saveDraft", groupId: GROUP }
    ]);
  });

  it("removes a link from its edit dialog", async () => {
    const user = userEvent.setup();
    renderView(owned());

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const [editFirst] = await screen.findAllByRole("button", { name: "Edit link" });
    await user.click(editFirst);
    const dialog = await screen.findByRole("dialog", { name: "Edit link" });
    await user.click(within(dialog).getByRole("button", { name: "Remove link" }));

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Edit link" })).toHaveLength(1)
    );
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  // The lookup itself runs in a saga; here its results are fed in by hand to
  // check the review step and what accepting does.
  it("proposes missing details and adds only the ones kept", async () => {
    const user = userEvent.setup();
    const { store, actions } = renderView(owned());

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Fill in details" }));

    const lookup = actions.find((action) => action.type === "collections/suggestDetails");
    expect(lookup.items).toEqual([
      { id: "a", link: "https://one.example.com", missing: ["snippet", "imageUrl"] },
      { id: "b", link: "https://two.example.com", missing: ["imageUrl"] }
    ]);

    const feed = (type, extra) => store.dispatch({ type, groupId: GROUP, ...extra });
    feed("collections/suggestionsStarted", { total: 2 });
    feed("collections/suggestionsResult", { itemId: "a", found: { snippet: "From the page" } });
    feed("collections/suggestionsResult", { itemId: "b", found: { imageUrl: "https://two.example.com/og.png" } });
    feed("collections/suggestionsFinished");

    const dialog = await screen.findByRole("dialog", { name: "Fill in missing details" });
    // Untick the second link, keep the first.
    const boxes = within(dialog).getAllByRole("checkbox");
    await user.click(boxes[1]);
    await user.click(within(dialog).getByRole("button", { name: "Add to 1 link" }));

    const draft = store.getState().collections.drafts[GROUP];
    expect(draft.items.a.snippet).toBe("From the page");
    expect(draft.items.b.imageUrl).toBe("");
    // Still only a draft: the saved item is unchanged until Save.
    expect(store.getState().collections.items.a.snippet).toBe("");
  });
});
