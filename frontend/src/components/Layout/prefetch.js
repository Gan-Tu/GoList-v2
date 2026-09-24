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

let myListsRequest = null;

/**
 * Starts downloading the lazy My Lists route (see App.jsx) before it is
 * needed. Hover, focus or a finger landing on a link comes 100–300ms before
 * the click, which is usually enough for the chunk to be ready, so the route
 * renders at once instead of flashing the loading fallback.
 *
 * The specifier resolves to the same module as the lazy route, so both share
 * one chunk. Calling it again is free.
 */
export function prefetchMyLists() {
  if (myListsRequest) return;
  myListsRequest = import("../Collections/MyCollections").catch(() => {
    // Only a head start: the route loads (or reports its error) on its own.
    // Forget the failure so a later hover can try again.
    myListsRequest = null;
  });
}

/** Spread onto any link to My Lists. */
export const prefetchMyListsProps = {
  onMouseEnter: prefetchMyLists,
  onFocus: prefetchMyLists,
  onTouchStart: prefetchMyLists
};

let logInRequest = null;

/**
 * The same head start for the sign-in dialog, which is its own chunk: every
 * visitor sees the Sign in button, few press it, and the dialog carries all
 * the provider logos.
 */
export function prefetchLogIn() {
  if (logInRequest) return;
  logInRequest = import("../Session/LogInModal").catch(() => {
    logInRequest = null;
  });
}

/** Spread onto the Sign in button. */
export const prefetchLogInProps = {
  onMouseEnter: prefetchLogIn,
  onFocus: prefetchLogIn,
  onTouchStart: prefetchLogIn
};
