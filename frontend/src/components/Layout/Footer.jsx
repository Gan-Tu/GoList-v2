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
    <footer className="border-t border-hairline">
      {/* The bottom padding clears the home indicator on phones — the page
          runs edge to edge (viewport-fit=cover in index.html). */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-[13px] text-fg-muted sm:px-6">
        <p>© {new Date().getFullYear()} GoList</p>
        {/* The policy is a real route now rather than a modal, so it can be
            linked to, bookmarked, and crawled. The negative margin grows the
            tap target without making the footer any taller. */}
        <Link
          to="/privacy"
          className="-mx-2 -my-2.5 rounded-md px-2 py-2.5 transition-colors duration-150 hover:text-fg"
        >
          Privacy
        </Link>
      </div>
    </footer>
  );
}
