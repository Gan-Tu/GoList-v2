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
import { useDocumentTitle } from "../../hooks/session";

/**
 * A real destination for a missing collection.
 *
 * Previously a bad short URL showed an indefinite "Loading..." spinner, then a
 * toast, then bounced to the home page on a timer — so the address bar lied
 * about where you were and there was nothing to read or act on.
 */
export default function NotFound({
  title = "This page doesn’t exist",
  message = "The link may be mistyped, or the collection may have been deleted."
}) {
  useDocumentTitle("Not found · GoList");

  return (
    <div className="w-full max-w-md text-center py-12">
      <p className="text-sm font-semibold text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-3 text-gray-600">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        Create a collection
      </Link>
    </div>
  );
}
