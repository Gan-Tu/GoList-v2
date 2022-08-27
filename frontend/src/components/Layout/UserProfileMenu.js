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

import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useDispatch } from "react-redux";
import classNames from "../Utilities/classNames";
import { useNavigate } from "react-router-dom";

const userNavigation = [
  // { name: "Your Profile", href: "#" },
  // { name: "Settings", href: "#" },
  { name: "Create List", href: "/" },
  { name: "View Demo List", href: "/demo" },
  { name: "Log out", href: "#" }
];

export function DesktopUserProfileMenu({ user }) {
  if (!user) return null;
  return (
    <Menu as="div" className="ml-3 relative">
      <div>
        <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="sr-only">Open user menu</span>
          {user?.photoURL ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user?.photoURL}
              alt={user.displayName || "Signed In"}
            />
          ) : (
            <p className="text-sm">
              {user?.displayName || user?.email || "Signed In"}
            </p>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  href={item.href}
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function MobileUserProfileMenu({ user }) {
  if (!user) return null;

  return (
    <div className="pt-4 pb-3 border-t border-gray-200">
      <div className="flex items-center px-4">
        <div className="flex-shrink-0">
          {user?.photoURL ? (
            <img
              className="h-10 w-10 rounded-full"
              src={user?.photoURL}
              alt={user.displayName || "You are signed In"}
            />
          ) : (
            <p className="text-sm">
              {user?.displayName || user?.email || "You are signed In"}
            </p>
          )}
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-800">
            {user?.displayName}
          </div>
          <div className="text-sm font-medium text-gray-500">{user?.email}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {userNavigation.map((item) => (
          <Disclosure.Button
            key={item.name}
            as="a"
            href={item.href}
            className="block px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          >
            {item.name}
          </Disclosure.Button>
        ))}
      </div>
    </div>
  );
}