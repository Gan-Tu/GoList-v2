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

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 py-4 items-center justify-between">
          <span className="text-sm text-gray-500">
            © {new Date().getFullYear()}{" "}
            <Link to="/" className="hover:underline">
              GoList
            </Link>
          </span>
          {/* The policy is a real route now rather than a modal, so it can be
              linked to, bookmarked, and crawled. */}
          <Link to="/privacy" className="text-sm text-gray-500 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
