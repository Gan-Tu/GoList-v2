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

import LogInModal from "../Session/LogInModal";
import { useEffect, useState } from "react";
import { useLoggedInUser } from "../../hooks/session";
import { useDispatch } from "react-redux";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { DesktopNavigation, MobileNavigation } from "./Navigation";
import classNames from "../Utilities/classNames";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};
const navigation = [
  // { name: "Dashboard", href: "#", current: true },
  // { name: "Team", href: "#", current: false },
  // { name: "Projects", href: "#", current: false },
  // { name: "Calendar", href: "#", current: false }
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" }
];

function UserProfile({ user, onLogin }) {
  const dispatch = useDispatch();
  if (user == null) {
    return (
      <button className="text-sm hover:underline" onClick={onLogin}>
        Login
      </button>
    );
  } else if (user?.photoURL) {
    return (
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch({ type: "LOG_OUT" })}>
          <img
            src={user.photoURL}
            className="w-10 h-10 rounded-full text-sm"
            alt={user.displayName || "Signed In"}
          />
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch({ type: "LOG_OUT" })}>
          <p className="text-sm">
            {user?.displayName || user?.email || "Signed In"}
          </p>
        </button>
      </div>
    );
  }
}

function NavBar() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const curUser = useLoggedInUser();

  const onLogin = () => {
    setSignInModalOpen(true);
  };

  useEffect(() => {
    if (curUser) {
      setSignInModalOpen(false);
    }
  }, [curUser]);

  return (
    // <nav className="bg-white border-gray-200 dark:bg-gray-800">
    //   <LogInModal
    //     isOpen={signInModalOpen}
    //     onClose={() => setSignInModalOpen(false)}
    //   />
    //   <div className="flex flex-wrap justify-between items-center px-6 py-2.5">
    //     <a href="/" className="flex items-center">
    //       <img
    //         src="/logo192.png"
    //         className="mr-3 h-6 sm:h-9"
    //         alt="GoList Logo"
    //       />
    //       <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
    //         GoList
    //       </span>
    //     </a>
    //     <div className="flex items-center">
    //       <UserProfile user={user} onLogin={onLogin} />
    //     </div>
    //   </div>
    // </nav>
    <Disclosure as="nav" className="bg-white border-b border-gray-200">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <a href="/" className="flex-shrink-0 flex items-center">
                  <img
                    src="/logo192.png"
                    className="mr-3 h-6 sm:h-9"
                    alt="GoList Logo"
                  />
                  <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                    GoList
                  </span>
                </a>
                {navigation?.length > 0 && (
                  <DesktopNavigation navigation={navigation} />
                )}
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      />
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
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
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
            {navigation?.length > 0 && (
              <MobileNavigation navigation={navigation} />
            )}

            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.imageUrl}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default NavBar;
