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

import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import LogInModal from "../Session/LogInModal";
import { classNames } from "../Utilities/Helpers";
import { useHasAccount, useLoggedInUser } from "../../hooks/session";

export default function UserProfileMenu({ isVertical }) {
  const dispatch = useDispatch();
  const user = useLoggedInUser();
  // An anonymous session exists so lists have an owner; it is not an account,
  // so the UI keeps offering sign-in rather than pretending they are logged in.
  const hasAccount = useHasAccount();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (hasAccount) setShowLogin(false);
  }, [hasAccount]);

  if (!hasAccount) {
    return (
      <div className={classNames(isVertical ? "border-t border-gray-200" : "")}>
        <LogInModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        <div
          className={classNames(
            isVertical ? "flex flex-col py-2" : "flex items-center gap-4"
          )}
        >
          {/* Anonymous visitors can own lists, so this stays reachable. */}
          <Link
            to="/_/myList"
            className={classNames(
              isVertical
                ? "px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                : "text-sm text-gray-600 hover:text-gray-900"
            )}
          >
            My Lists
          </Link>
          <button
            type="button"
            className={classNames(
              isVertical
                ? "px-4 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
                : "rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            )}
            onClick={() => setShowLogin(true)}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const label = user?.displayName || user?.email || "Account";
  const navigation = [
    { name: "My Lists", to: "/_/myList" },
    { name: "Sign out", onClick: () => dispatch({ type: "session/logOut" }) }
  ];

  if (isVertical) {
    return (
      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4">
          {user?.photoURL ? (
            <img
              className="h-10 w-10 rounded-full"
              src={user.photoURL}
              alt=""
              width="40"
              height="40"
            />
          ) : null}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {user?.displayName || "Signed in"}
            </div>
            {user?.email && (
              <div className="text-sm text-gray-500 truncate">{user.email}</div>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {navigation.map((item) =>
            item.to ? (
              <Link
                key={item.name}
                to={item.to}
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={item.name}
                type="button"
                onClick={item.onClick}
                className="w-full text-left block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {item.name}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <Menu as="div" className="ml-3 relative">
      <Menu.Button className="flex items-center gap-2 max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span className="sr-only">Open user menu</span>
        {user?.photoURL ? (
          <img
            className="h-8 w-8 rounded-full"
            src={user.photoURL}
            alt=""
            width="32"
            height="32"
          />
        ) : (
          <span className="rounded-full bg-gray-900 text-white h-8 w-8 flex items-center justify-center text-xs font-semibold uppercase">
            {label.slice(0, 1)}
          </span>
        )}
        <span className="hidden lg:block max-w-[12rem] truncate text-gray-700">
          {label}
        </span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          {navigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) =>
                item.to ? (
                  <Link
                    to={item.to}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 text-sm text-gray-700"
                    )}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "w-full text-left block px-4 py-2 text-sm text-gray-700"
                    )}
                  >
                    {item.name}
                  </button>
                )
              }
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
