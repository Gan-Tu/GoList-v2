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

import { Fragment, Suspense, lazy, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import Button from "../Utilities/Button";
import Monogram from "../Utilities/Monogram";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  QueueListIcon
} from "../Utilities/SvgIcons";
import { classNames } from "../Utilities/Helpers";
import {
  useAuthResolved,
  useHasAccount,
  useLoggedInUser
} from "../../hooks/session";
import { prefetchLogInProps, prefetchMyListsProps } from "./prefetch";

// Split out: only a visitor who presses Sign in needs the dialog and its
// provider logos. prefetchLogIn starts the download on hover or touch, so the
// dialog is usually ready by the time the click lands.
const LogInModal = lazy(() => import("../Session/LogInModal"));

// Header controls are drawn at 32px to suit a 56px bar, which is short of a
// comfortable touch target. An invisible pseudo-element stretches each hit
// area to the full height of the bar without changing what is drawn.
const TALL_HIT_AREA = "after:absolute after:inset-x-0 after:-inset-y-3";

const MENU_ROW =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-fg";

function MyListsLink() {
  return (
    <Button
      as={NavLink}
      to="/_/myList"
      variant="ghost"
      size="sm"
      // Full-strength text, not the ghost variant's muted gray: the header is
      // translucent, and muted text over whatever scrolls beneath it can fall
      // below 4.5:1.
      className={classNames("!text-fg aria-[current=page]:bg-subtle", TALL_HIT_AREA)}
      {...prefetchMyListsProps}
    >
      My Lists
    </Button>
  );
}

/** The account photo, or a lettered tile when there is none or it fails. */
function Avatar({ user, label }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const src = user?.photoURL;

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt=""
        width="32"
        height="32"
        decoding="async"
        // Provider photo hosts (Google's in particular) can refuse requests
        // that carry a Referer.
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className="h-8 w-8 shrink-0 rounded-full bg-subtle object-cover ring-1 ring-black/5 dark:ring-white/10"
      />
    );
  }

  return (
    <Monogram
      seed={user?.uid || label}
      label={label}
      className="h-8 w-8 shrink-0 rounded-full"
      letterClassName="text-[13px]"
    />
  );
}

/** The signed-in control: the account photo, opening a small menu. */
function AccountMenu({ user }) {
  const dispatch = useDispatch();
  const label = user?.displayName || user?.email || "Account";

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={({ open }) =>
          classNames(
            "relative flex animate-fade-in items-center gap-2 rounded-full p-0.5 text-fg",
            "transition-colors duration-150 ease-smooth hover:bg-subtle lg:pr-2.5",
            open && "bg-subtle",
            TALL_HIT_AREA
          )
        }
        {...prefetchMyListsProps}
      >
        <span className="sr-only">Open user menu</span>
        <Avatar user={user} label={label} />
        <span className="hidden max-w-[12rem] truncate text-sm font-medium lg:block">
          {label}
        </span>
        <ChevronDownIcon
          className="hidden h-4 w-4 text-fg-muted lg:block"
          strokeWidth={2}
          aria-hidden="true"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition duration-150 ease-smooth"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-100 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl bg-elevated p-1.5 shadow-popover ring-1 ring-black/5 focus:outline-none dark:ring-white/10">
          <div className="px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-medium text-fg">
              {user?.displayName || "Signed in"}
            </p>
            {user?.email && (
              <p className="mt-0.5 truncate text-[13px] text-fg-muted">
                {user.email}
              </p>
            )}
          </div>
          <div className="-mx-1.5 mb-1.5 h-px bg-hairline" aria-hidden="true" />
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/_/myList"
                className={classNames(MENU_ROW, active && "bg-subtle")}
              >
                <QueueListIcon
                  className="h-4 w-4 shrink-0 text-fg-muted"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                My Lists
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={() => dispatch({ type: "session/logOut" })}
                className={classNames(MENU_ROW, active && "bg-subtle")}
              >
                <ArrowRightStartOnRectangleIcon
                  className="h-4 w-4 shrink-0 text-fg-muted"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function UserProfileMenu() {
  const user = useLoggedInUser();
  // An anonymous session exists so lists have an owner; it is not an account,
  // so the UI keeps offering sign-in rather than pretending they are logged in.
  const hasAccount = useHasAccount();
  // Until Firebase restores a persisted session, "no account" may be wrong:
  // the Sign in button keeps its space but stays hidden rather than flashing
  // up for a returning user only to be swapped for their avatar.
  const authResolved = useAuthResolved();
  const [showLogin, setShowLogin] = useState(false);
  // The dialog's chunk is fetched on the first press, not on page load.
  const [loginRequested, setLoginRequested] = useState(false);

  useEffect(() => {
    if (hasAccount) setShowLogin(false);
  }, [hasAccount]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Anonymous visitors can own lists, so this stays reachable. */}
      <MyListsLink />
      {hasAccount ? (
        <AccountMenu user={user} />
      ) : (
        <Button
          size="sm"
          className={classNames(
            TALL_HIT_AREA,
            authResolved ? "animate-fade-in" : "invisible"
          )}
          onClick={() => {
            setLoginRequested(true);
            setShowLogin(true);
          }}
          {...prefetchLogInProps}
        >
          Sign in
        </Button>
      )}
      {/* Rendered in both states so that signing in closes the dialog with
          its usual transition instead of unmounting it mid-frame. */}
      {loginRequested && (
        <Suspense fallback={null}>
          <LogInModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </Suspense>
      )}
    </div>
  );
}
