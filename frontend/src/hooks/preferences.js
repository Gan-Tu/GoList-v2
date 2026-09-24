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

import { useCallback, useEffect, useState } from "react";

const VIEW_KEY = "golist.collectionView";
const VIEWS = ["grid", "list"];
// Rows by default: they show several times more links per screen than cards,
// which is what skimming a shared list is for. The grid is one tap away.
const DEFAULT_VIEW = "list";

function readView() {
  try {
    const stored = window.localStorage.getItem(VIEW_KEY);
    return VIEWS.includes(stored) ? stored : DEFAULT_VIEW;
  } catch {
    // Private windows and blocked site data throw here; use the default.
    return DEFAULT_VIEW;
  }
}

/**
 * How a collection's links are laid out: "list" (rows, the default) or
 * "grid" (cards).
 *
 * One choice for every collection, remembered in this browser: someone who
 * would rather scan a list wants it on the next list they open too — any
 * goli.st address, after a reload or a week later. It is read while
 * rendering, so a returning visitor's first frame (and the loading skeleton)
 * is already in their layout. localStorage rather than a cookie: the server
 * never needs it, and a cookie would ride along on every request.
 */
export function useCollectionView() {
  const [view, setView] = useState(readView);

  // Another open tab switching layout switches this one too, rather than
  // leaving two tabs of the same site disagreeing until the next reload.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === VIEW_KEY) setView(readView());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
