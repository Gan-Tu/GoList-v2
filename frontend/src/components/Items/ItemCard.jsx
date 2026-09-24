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

import { useId } from "react";
import { ItemMedia, ItemThumbnail, SiteMonogram } from "./ItemMedia";
import { ItemSnippetView, hasMetadata, itemStatus } from "./ItemSnippet";
import { classNames, displayHost, safeHref } from "../Utilities/Helpers";
import { useItemData, useItemIsSaving } from "../../hooks/data";

// h-full lets every card in a grid row stretch to the tallest one.
const CARD_CLASS =
  "flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card";

const INTERACTIVE_CLASS =
  "group transition duration-200 ease-smooth hover:shadow-card-hover " +
  "motion-safe:hover:-translate-y-0.5 active:scale-[0.99]";

// A row sits inside the list view's single rounded panel, which draws the
// border and the dividers; the row itself only lights up on hover.
const ROW_CLASS = "flex items-center gap-3.5 px-4 py-3 sm:gap-4 sm:px-5";

// The focus outline is pulled inside the row, since the panel clips anything
// drawn outside it.
const ROW_INTERACTIVE_CLASS =
  "group transition-colors duration-150 ease-smooth hover:bg-subtle/60 " +
  "active:bg-subtle focus-visible:-outline-offset-2";

/**
 * A link as a card: preview image (or monogram), site, title, description.
 *
 * layout:  "media"   — a 1.91:1 image area on top; used when any link in the
 *                      collection has an image, so the grid stays even.
 *          "compact" — a small monogram tile beside the text, for collections
 *                      with no images at all, where a grid of big letter
 *                      tiles would be mostly empty color.
 *          "row"     — the list view: a thumbnail, then the text on one or
 *                      two lines. `wideThumbnail` gives the thumbnail the
 *                      banner shape when the collection has images.
 * preview: renders the card exactly as the grid will, but not as a link —
 *          for the edit dialog.
 */
export function ItemCardView({
  data,
  layout = "media",
  wideThumbnail = false,
  priority = false,
  isSaving = false,
  preview = false
}) {
  const titleId = useId();
  const hostId = useId();
  const snippetId = useId();
  const newTabId = useId();

  const href = preview ? "" : safeHref(data?.link);
  const host = displayHost(data?.link);
  const status = itemStatus(data, isSaving);

  const text = (
    <ItemSnippetView
      data={data}
      status={status}
      showArrow={preview || Boolean(href)}
      titleAs={preview ? "p" : "h2"}
      snippetLines={layout === "row" ? 1 : 2}
      ids={{ title: titleId, host: hostId, snippet: snippetId }}
    />
  );

  const body =
    layout === "row" ? (
      <>
        <ItemThumbnail
          src={safeHref(data?.imageUrl)}
          seed={host}
          wide={wideThumbnail}
          size="lg"
          priority={priority}
        />
        {text}
      </>
    ) : layout === "media" ? (
      <>
        <ItemMedia
          src={safeHref(data?.imageUrl)}
          seed={host}
          priority={priority}
          pending={isSaving && !hasMetadata(data)}
        />
        <div className="flex flex-1 flex-col p-4">{text}</div>
      </>
    ) : (
      <div className="flex flex-1 items-start gap-3.5 p-4">
        <SiteMonogram
          host={host}
          className="h-10 w-10 shrink-0 rounded-xl"
          letterClassName="text-base"
        />
        {text}
      </div>
    );

  // A stored link that is not http(s) gets no href at all rather than becoming
  // a clickable javascript: URL in someone else's browser.
  const frame = layout === "row" ? ROW_CLASS : CARD_CLASS;
  const interactive =
    layout === "row" ? ROW_INTERACTIVE_CLASS : INTERACTIVE_CLASS;

  if (!href) {
    return <div className={frame}>{body}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      // Named by its title alone; the site and description follow as the
      // description, instead of the whole card being read as one long name.
      aria-labelledby={`${titleId} ${newTabId}`}
      aria-describedby={classNames(
        hostId,
        String(data?.snippet || "").trim() && !status && snippetId
      )}
      className={classNames(frame, interactive)}
    >
      {body}
      <span id={newTabId} className="sr-only">
        (opens in a new tab)
      </span>
    </a>
  );
}

export default function ItemCard({ id, layout, wideThumbnail, priority }) {
  const data = useItemData(id);
  const isSaving = useItemIsSaving(id);

  return (
    <ItemCardView
      data={data}
      layout={layout}
      wideThumbnail={wideThumbnail}
      priority={priority}
      isSaving={isSaving}
    />
  );
}
