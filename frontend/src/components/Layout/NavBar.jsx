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

import { Disclosure } from "@headlessui/react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "../Utilities/SvgIcons";
import UserProfileMenu from "./UserProfileMenu";

export default function NavBar() {
  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex justify-between h-16">
              {/* A router Link, not an <a>: an anchor here threw away the SPA
                  and reloaded the whole bundle on every logo click. */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                <img
                  src="/logo192.png"
                  className="h-6 sm:h-9 w-auto"
                  alt=""
                  width="36"
                  height="36"
                />
                <span className="self-center text-xl font-semibold whitespace-nowrap">
                  GoList <span className="text-xs font-light">Beta</span>
                </span>
              </Link>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <UserProfileMenu isVertical={false} />
              </div>

              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">
                    {open ? "Close main menu" : "Open main menu"}
                  </span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <UserProfileMenu isVertical={true} />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
