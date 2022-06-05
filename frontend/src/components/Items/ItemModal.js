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

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import {
  useItemTitle,
  useItemSnippet,
  useItemImage,
  useItemLinkTarget,
} from "../../hooks/items";
import { motion } from "framer-motion";

function ExitButton({ onExit }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      onClick={onExit}
      className="text-sm font-medium text-black"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </motion.button>
  );
}

function SaveButton() {
  const [isSaved, setIsSaved] = useState(false);

  const onSave = () => {
    setIsSaved(true);
  };

  if (!isSaved) {
    return (
      <button
        type="button"
        className="inline-flex justify-center text-center items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        onClick={onSave}
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4 mr-2" />
        Save
      </button>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex justify-center text-center items-center rounded-md border border-transparent bg-green-100 pl-3 pr-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      onClick={onSave}
    >
      <svg
        className="w-6 h-6 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Saved
    </button>
  );
}

export default function ItemModal({ itemId, isOpen, onClose }) {
  const title = useItemTitle(itemId);
  const snippet = useItemSnippet(itemId);
  const image = useItemImage(itemId);
  const link_target = useItemLinkTarget(itemId);

  return (
    <Fragment>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex justify-between text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                    <ExitButton onExit={onClose} />
                  </Dialog.Title>

                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex-1 min-w-0 mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
                        {snippet}
                      </p>
                    </div>
                    <div className="flex-shrink-0 m-2">
                      <img
                        className="w-12 h-12 rounded"
                        src={image}
                        alt="Preview"
                      />
                    </div>
                  </div>

                  <span className="inline-flex justify-between text-xs font-normal text-gray-600">
                    {link_target}
                  </span>

                  <div className="mt-6">
                    <SaveButton />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
}
