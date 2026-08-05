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

import { useState } from "react";
import { displayHost } from "../Utilities/Helpers";
import { LinkIcon } from "../Utilities/SvgIcons";
import { useItemData } from "../../hooks/data";

export function ItemSnippetView({ data }) {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = data?.imageUrl;

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        {/* A link with no metadata yet still needs something readable, so the
            hostname stands in for a title rather than rendering an empty row. */}
        <p className="line-clamp-1 text-sm font-medium text-gray-900">
          {data?.title || displayHost(data?.link) || "Untitled link"}
        </p>
        {data?.snippet && (
          <p className="line-clamp-2 text-sm text-gray-500">{data.snippet}</p>
        )}
        {data?.link && (
          <p className="line-clamp-1 text-xs text-gray-400">
            {displayHost(data.link)}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        {thumbnail && !imageFailed ? (
          <img
            className="h-12 w-12 rounded object-cover bg-gray-100"
            src={thumbnail}
            alt=""
            width="48"
            height="48"
            // Explicit dimensions reserve the space, so previews loading in
            // after the card does not shift the list under the reader.
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
            <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItemSnippet({ id }) {
  const data = useItemData(id);
  return <ItemSnippetView data={data} />;
}
