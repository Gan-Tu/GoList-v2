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

import { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "./SvgIcons";
import { classNames } from "./Helpers";

function noop() {}

const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg"
};

// Third-party launchers (the Intercom bubble) sit above every z-index. On a
// phone that puts them on top of a bottom sheet's action buttons, so they are
// hidden while any dialog is open — see the matching rule in index.css.
// Counted, so closing one dialog as another opens does not bring it back early.
let openDialogs = 0;

function useHideFloatingLaunchers(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined;
    openDialogs += 1;
    document.documentElement.setAttribute("data-dialog-open", "");
    return () => {
      openDialogs -= 1;
      if (openDialogs === 0) {
        document.documentElement.removeAttribute("data-dialog-open");
      }
    };
  }, [isOpen]);
}

/**
 * A sheet that rises from the bottom edge on phones — within thumb reach, and
 * the pattern iOS users expect — and a centered dialog from `sm` up.
 *
 * Children render inside a scrollable body, so a long form never pushes the
 * title off screen. End forms with <ModalActions>. Pass `initialFocus` (a ref
 * to the first field) so the keyboard lands where typing starts rather than
 * on the close button.
 */
export default function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
  size = "md",
  initialFocus
}) {
  useHideFloatingLaunchers(Boolean(isOpen));

  return (
    <Transition appear show={Boolean(isOpen)} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose || noop}
        initialFocus={initialFocus}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60"
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="transition duration-300 ease-smooth sm:duration-200"
              enterFrom="translate-y-full sm:translate-y-2 sm:scale-[0.98] sm:opacity-0"
              enterTo="translate-y-0 sm:scale-100 sm:opacity-100"
              leave="transition duration-200 ease-in sm:duration-150"
              leaveFrom="translate-y-0 sm:scale-100 sm:opacity-100"
              leaveTo="translate-y-full sm:translate-y-2 sm:scale-[0.98] sm:opacity-0"
            >
              <Dialog.Panel
                className={classNames(
                  "relative flex max-h-[92dvh] w-full flex-col overflow-hidden",
                  "rounded-t-[22px] bg-elevated text-left shadow-popover",
                  "ring-1 ring-black/5 dark:ring-white/10",
                  "sm:max-h-[min(88dvh,56rem)] sm:rounded-2xl",
                  SIZES[size] || SIZES.md
                )}
              >
                <div className="flex items-start gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                  <div className="min-w-0 flex-1">
                    <Dialog.Title
                      as="h2"
                      className="text-[17px] font-semibold leading-6 tracking-tight text-fg"
                    >
                      {title}
                    </Dialog.Title>
                    {description && (
                      <Dialog.Description className="mt-1 text-pretty text-sm leading-5 text-fg-muted">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="-mr-2 -mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-muted transition-colors hover:bg-subtle hover:text-fg"
                    >
                      {/* Icon-only controls need an accessible name. */}
                      <span className="sr-only">Close dialog</span>
                      <XMarkIcon
                        className="h-5 w-5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/**
 * The footer row for a dialog. DOM order is [secondary…, primary]: the primary
 * sits on the right on desktop and on top, full width, on a phone.
 *
 * It also sizes its buttons, whatever size they were given: the 44px touch
 * target on a phone, where they stack under a thumb, and the regular 36px from
 * `sm` up, where they sit side by side under a pointer.
 */
export function ModalActions({ children, className = "" }) {
  return (
    <div
      className={classNames(
        "mt-6 flex flex-col-reverse gap-2",
        "*:h-11 *:w-full *:px-5 *:text-[15px]",
        "sm:flex-row sm:items-center sm:justify-end",
        "sm:*:h-9 sm:*:w-auto sm:*:px-4 sm:*:text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
