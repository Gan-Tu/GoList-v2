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

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { classNames } from "../Utilities/Helpers";
import UserProfileMenu from "./UserProfileMenu";

/**
 * True once the page has scrolled at all. An IntersectionObserver on a pixel
 * at the very top of the document reports the crossing, so nothing runs on
 * each scroll event.
 */
function useScrolledPastTop(sentinelRef) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting)
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  return scrolled;
}

export default function NavBar() {
  const sentinelRef = useRef(null);
  const scrolled = useScrolledPastTop(sentinelRef);

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />
      {/* Translucent so the page shows through as it scrolls under. There
          are only two destinations, so they are always on screen, at every
          width, rather than behind a menu button. */}
      <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-xl backdrop-saturate-150">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        >
          {/* A router Link, not an <a>: an anchor here threw away the SPA
              and reloaded the whole bundle on every logo click. */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-lg transition-opacity duration-150 hover:opacity-80"
          >
            {/* A transparent, tightly cropped mark: logo192.png is the
                home-screen icon, drawn on white with safe-zone padding. */}
            <img
              src="/logo-mark.png"
              className="h-7 w-7"
              alt=""
              width="28"
              height="28"
            />
            <span className="text-[17px] font-semibold tracking-tight text-fg">
              GoList
            </span>{" "}
            {/* Dropped on the narrowest phones, where the header controls
                need the room more. The space before it is invisible in the
                flex row but keeps the link's name from reading "GoListBeta". */}
            <span className="hidden rounded-full bg-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-3 tracking-wider text-fg-muted min-[360px]:inline-block">
              Beta
            </span>
          </Link>

          <UserProfileMenu />
        </nav>

        {/* The header and the canvas read as one surface at the top of the
            page; this hairline fades in only once content passes beneath. */}
        <div
          className={classNames(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-hairline transition-opacity duration-200",
            scrolled ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />
      </header>
    </>
  );
}
