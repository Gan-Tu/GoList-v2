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

import { useItemData } from "../../hooks/items";

export function ItemSnippetView({ data }) {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0 w-60 lg:w-80 space-y-1">
          <p className="text-sm font-medium text-gray-900 line-clamp-1 text-ellipsis overflow-hidden dark:text-white">
            {data?.title || ""}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
            {data?.snippet || ""}
          </p>
          <span className="inline-flex justify-between text-xs font-normal line-clamp-1 text-gray-600 text-ellipsis overflow-hidden">
            {data?.linkTarget || ""}
          </span>
        </div>
        <div className="flex-shrink-0 m-2">
          <img
            className="w-12 h-12 rounded"
            src={data?.imageUrl || ""}
            alt="Preview"
          />
        </div>
      </div>
    </div>
  );
}

export default function ItemSnippet({ id }) {
  const data = useItemData(id);
  return <ItemSnippetView data={data} />;
}
