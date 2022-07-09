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

import toast from "react-hot-toast";

export default function Footer() {
  return (
    <footer className="flex flex-wrap px-6 py-2.5 m-4 bg-white items-center justify-between dark:bg-gray-800">
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        © 2021{" "}
        <a href="/" className="hover:underline">
          GoList
        </a>
        {/* . All Rights Reserved. */}
      </span>
      <ul className="text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        <li>
          <button
            className="hover:underline"
            onClick={() => toast.error("Privacy Policy is not implemented yet")}
          >
            Privacy Policy
          </button>
        </li>
      </ul>
    </footer>
  );
}
