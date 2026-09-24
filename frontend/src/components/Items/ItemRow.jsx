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

import { ItemThumbnail } from "./ItemMedia";
import { itemLabel } from "./ItemSnippet";
import { displayHost, safeHref } from "../Utilities/Helpers";
import { Spinner } from "../Utilities/SvgIcons";

/** The stack of rows — shared so the lazy list and its fallback match. */
export const ROW_LIST_CLASS = "grid gap-2";

/** The frame of a compact row; callers add the shadow (it changes on drag). */
export const ROW_CLASS =
  "flex items-center gap-2 rounded-xl border border-hairline bg-surface p-2 pr-2.5 sm:gap-3";

/**
 * A link reduced to one line: thumbnail, title, site. Edit mode lists links
 * this way (reordering a grid of tall cards means dragging past a screenful),
 * and the delete confirmation shows the row it is about to remove.
 */
export function ItemRowSummary({
  data,
  status = null,
  wideThumbnail = false,
  thumbnailClassName = "",
  titleId
}) {
  const host = displayHost(data?.link);

  return (
    <>
      <ItemThumbnail
        src={safeHref(data?.imageUrl)}
        seed={host}
        wide={wideThumbnail}
        className={thumbnailClassName}
      />
      <div className="min-w-0 flex-1">
        <p
          id={titleId}
          className="line-clamp-1 text-sm font-medium leading-5 text-fg [overflow-wrap:anywhere]"
        >
          {itemLabel(data)}
        </p>
        {status ? (
          <p className="flex items-center gap-1.5 text-[13px] leading-5 text-fg-muted">
            <Spinner className="h-3 w-3" />
            {status}
          </p>
        ) : (
          <p className="truncate text-[13px] leading-5 text-fg-muted">{host}</p>
        )}
      </div>
    </>
  );
}
