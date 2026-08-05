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
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "./SvgIcons";

function noop() {}

export default function Modal({ title, isOpen, onClose, children, maxWidth }) {
  return (
    <Transition appear show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose || noop}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${
                  maxWidth || "max-w-md"
                }`}
              >
                <Dialog.Title
                  as="h3"
                  className="flex items-center justify-between gap-4 text-lg font-medium leading-6 text-gray-900"
                >
                  <span className="truncate">{title}</span>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {/* Icon-only controls need an accessible name. */}
                      <span className="sr-only">Close dialog</span>
                      <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
