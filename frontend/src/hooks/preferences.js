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

import { useCallback, useState } from "react";

const VIEW_KEY = "golist.collectionView";
const VIEWS = ["grid", "list"];

function readView() {
  try {
    const stored = window.localStorage.getItem(VIEW_KEY);
    return VIEWS.includes(stored) ? stored : "grid";
  } catch {
    // Private windows and blocked site data throw here; cards are the default.
    return "grid";
  }
}

/**
 * How a collection's links are laid out: "grid" (cards) or "list" (rows).
 *
 * One choice for every collection, remembered in this browser: someone who
 * would rather scan a list wants it on the next list they open too. It is read
 * while rendering, so a returning visitor's first frame (and the loading
 * skeleton) is already in their layout.
 */
export function useCollectionView() {
  const [view, setView] = useState(readView);

  const update = useCallback((next) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* not remembered, but still applied for this visit */
    }
  }, []);

  return [view, update];
}
