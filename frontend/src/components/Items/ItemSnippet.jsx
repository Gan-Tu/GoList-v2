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

import { displayHost } from "../Utilities/Helpers";
import { ArrowUpRightIcon, Spinner } from "../Utilities/SvgIcons";

/**
 * What a link is called on screen. A link with no metadata yet still needs
 * something readable, so the hostname stands in for a title rather than
 * rendering an empty row.
 */
export function itemLabel(data) {
  return (
    String(data?.title || "").trim() || displayHost(data?.link) || "Untitled link"
  );
}

/** Whether a link has any preview metadata yet (a brand-new one has none). */
export function hasMetadata(data) {
  return Boolean(data?.title || data?.snippet || data?.imageUrl);
}

/**
 * A short progress note for an item with a write in flight. A brand-new link
 * has no metadata until the server fetches its preview; anything else is an
 * edit being saved.
 */
export function itemStatus(data, isSaving) {
  if (!isSaving) return null;
  return hasMetadata(data) ? "Saving…" : "Fetching preview…";
}

/**
 * The text half of a link card: site, title, description.
 *
 * `ids` lets the card point its accessible name at the title alone, rather
 * than at every word on the card. `titleAs` is h2 in the collection grid (the
 * page's h1 is the collection) and a plain paragraph in previews.
 */
export function ItemSnippetView({
  data,
  status = null,
  showArrow = false,
  titleAs: Title = "p",
  ids = {}
}) {
  const host = displayHost(data?.link);
  const snippet = String(data?.snippet || "").trim();

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2">
        <p
          id={ids.host}
          className="min-w-0 flex-1 truncate text-[13px] leading-5 text-fg-muted"
        >
          {host}
        </p>
        {showArrow && (
          // Says "this leaves the page" before the click, and brightens with
          // the card's hover.
          <ArrowUpRightIcon
            className="h-4 w-4 shrink-0 text-fg-subtle transition duration-200 ease-smooth group-hover:text-fg motion-safe:group-hover:-translate-y-px motion-safe:group-hover:translate-x-px"
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
      </div>

      <Title
        id={ids.title}
        className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-fg [overflow-wrap:anywhere]"
      >
        {itemLabel(data)}
      </Title>

      {status ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm leading-5 text-fg-muted">
          <Spinner className="h-3.5 w-3.5" />
          {status}
        </p>
      ) : (
        snippet && (
          <p
            id={ids.snippet}
            className="mt-1 line-clamp-2 text-sm leading-5 text-fg-muted text-pretty"
          >
            {snippet}
          </p>
        )
      )}
    </div>
  );
}
