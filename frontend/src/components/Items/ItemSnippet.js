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

import {
  useItemTitle,
  useItemSnippet,
  useItemImage,
  useItemLinkTarget,
} from "../../hooks/items";

export default function ItemSnippet({ id }) {
  const title = useItemTitle(id);
  const snippet = useItemSnippet(id);
  const image = useItemImage(id);
  const link_target = useItemLinkTarget(id);

  return (
    <div>
      <div className="flex items-center space-x-4 ">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {title}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
            {snippet}
          </p>
        </div>
        <div className="flex-shrink-0 m-2">
          <img className="w-12 h-12 rounded" src={image} alt="Preview" />
        </div>
      </div>
      <span className="inline-flex justify-between text-xs font-normal text-gray-600">
        {link_target}
      </span>
    </div>
  );
}
