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

import { Link } from "react-router-dom";
import { SolidHomeIcon, RightChevronIcon } from "./SvgIcons";

export default function Breadcrumb({ title }) {
  return (
    <nav className="flex p-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <SolidHomeIcon className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <RightChevronIcon className="w-6 h-6 text-gray-400" />
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
              {title}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}
