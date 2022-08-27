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
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { DesktopNavigation, MobileNavigation } from "./Navigation";
import {
  MobileUserProfileMenu,
  DesktopUserProfileMenu
} from "./UserProfileMenu";

const navigation = [
  // { name: "Dashboard", href: "#", current: true },
  // { name: "Team", href: "#", current: false },
  // { name: "Projects", href: "#", current: false },
  // { name: "Calendar", href: "#", current: false }
];
const userNavigation = [
  // { name: "Your Profile", href: "#" },
  // { name: "Settings", href: "#" },
  { name: "Log out", href: "#" }
];

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
    <Disclosure as="nav" className="bg-white border-b border-gray-200">
      {({ open }) => (
        <>
          <LogInModal
            isOpen={signInModalOpen}
            onClose={() => setSignInModalOpen(false)}
          />

          {/* Main Navbar */}
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
                <DesktopUserProfileMenu
                  user={curUser}
                  onLogin={onLogin}
                  userNavigation={userNavigation}
                />
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center sm:hidden">
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

          {/* Mobile navigation panel */}
          <Disclosure.Panel className="sm:hidden">
            {navigation?.length > 0 && (
              <MobileNavigation navigation={navigation} />
            )}
            <MobileUserProfileMenu
              user={curUser}
              onLogin={onLogin}
              userNavigation={userNavigation}
            />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default NavBar;
