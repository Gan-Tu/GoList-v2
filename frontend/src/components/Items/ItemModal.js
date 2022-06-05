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
import { Fragment, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
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

function SaveButton({ isSaved, setIsSaved }) {
  const onSave = () => {
    setIsSaved(true);
  };

  if (!isSaved) {
    return (
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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

  const [newTitle, setNewTitle] = useState("");
  const [newSnippet, setNewSnippet] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLinkTarget, setNewLinkTarget] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNewTitle(title);
    setNewSnippet(snippet);
    setNewImage(image);
    setNewLinkTarget(link_target);
  }, [title, snippet, image, link_target]);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        onClose();
        setIsSaved(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

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
                    Edit Item Details
                    <ExitButton onExit={onClose} />
                  </Dialog.Title>

                  <form className="mt-5">
                    <div className="mb-6">
                      <label
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between"
                      >
                        Item Title{" "}
                        {newTitle?.length > 40 ? (
                          <span className="text-red-500 font-sm">
                            ({newTitle?.length || 0}/40 characters)
                          </span>
                        ) : (
                          <span className="text-gray-500 font-sm">
                            ({newTitle?.length || 0}/40 characters)
                          </span>
                        )}
                      </label>
                      <input
                        disabled={isSaved}
                        type="text"
                        id="title"
                        className="shadow-sm disabled:text-gray-500 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="snippet"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between"
                      >
                        Item Snippet{" "}
                        {newSnippet?.length > 100 ? (
                          <span className="text-red-500 font-sm">
                            ({newSnippet?.length || 0}/100 characters)
                          </span>
                        ) : (
                          <span className="text-gray-500 font-sm">
                            ({newSnippet?.length || 0}/100 characters)
                          </span>
                        )}
                      </label>
                      <textarea
                        id="snippet"
                        disabled={isSaved}
                        rows="3"
                        className="block disabled:text-gray-500 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={newSnippet}
                        onChange={(e) => setNewSnippet(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="link_target"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between"
                      >
                        Item URL
                      </label>
                      <input
                        type="text"
                        id="link_target"
                        disabled={isSaved}
                        className="shadow-sm disabled:text-gray-500 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        value={newLinkTarget}
                        onChange={(e) => setNewLinkTarget(e.target.value)}
                        required
                      />
                    </div>
                    <SaveButton isSaved={isSaved} setIsSaved={setIsSaved} />
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
}
