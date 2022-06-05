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
import { ItemSnippetView } from "./ItemSnippet";
import { useDispatch } from "react-redux";
import TextInput from "../Utilities/TextInput";

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

function SaveButton({ isSaved, onSave }) {
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
      disabled={true}
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

function PreviewButton({ isPreview, setIsPreview }) {
  let eyeIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  let eyeOffIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );

  return (
    <button
      type="button"
      className="flex items-center border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-black"
      onClick={() => setIsPreview(!isPreview)}
    >
      {isPreview ? eyeOffIcon : eyeIcon}
      {isPreview ? "Exit Preview" : "Preview"}
    </button>
  );
}

export default function ItemModal({ itemId, isOpen, onClose }) {
  const title = useItemTitle(itemId);
  const snippet = useItemSnippet(itemId);
  const image = useItemImage(itemId);
  const linkTarget = useItemLinkTarget(itemId);

  const [newTitle, setNewTitle] = useState("");
  const [newSnippet, setNewSnippet] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLinkTarget, setNewLinkTarget] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const dispatch = useDispatch();

  const onSave = () => {
    setIsSaved(true);
    if (
      title !== newTitle ||
      snippet !== newSnippet ||
      image !== newImage ||
      linkTarget !== newLinkTarget
    ) {
      dispatch({
        type: "UPDATE_ITEM",
        id: itemId,
        data: {
          title: newTitle,
          snippet: newSnippet,
          imageUrl: newImage,
          linkTarget: newLinkTarget,
        },
      });
    }
    // else add a notification
  };

  useEffect(() => {
    setNewTitle(title);
    setNewSnippet(snippet);
    setNewImage(image);
    setNewLinkTarget(linkTarget);
  }, [title, snippet, image, linkTarget]);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        onClose();
        setIsSaved(false);
        setIsPreview(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSaved, onClose]);

  let newCardPreview = (
    <div className="sm:py-4 border rounded-lg p-4 mt-4 hover:shadow-lg">
      <a href={newLinkTarget || "#"} target="_blank" rel="noreferrer">
        <ItemSnippetView
          title={newTitle}
          snippet={newSnippet}
          image={newImage}
          linkTarget={newLinkTarget}
        />
      </a>
    </div>
  );

  let editForm = (
    <div className="space-y-6">
      {newImage && (
        <div className="flex flex-shrink-0 m-2 justify-center">
          <img
            className="w-24 h-24 rounded"
            src={newImage}
            alt="Thumbnail Preview"
          />
        </div>
      )}

      <TextInput
        inputId="imageUrl"
        labelText="Thumbnail Url"
        value={newImage}
        setValue={setNewImage}
        isDisabled={isSaved}
        isRequired={true}
      />

      <TextInput
        inputId="title"
        labelText="Item Title"
        value={newTitle}
        setValue={setNewTitle}
        isDisabled={isSaved}
        isRequired={true}
        showCharacterCount={true}
        characterLimit={40}
      />

      <TextInput
        inputId="snippet"
        labelText="Item Snippet"
        value={newSnippet}
        setValue={setNewSnippet}
        isDisabled={isSaved}
        isRequired={true}
        showCharacterCount={true}
        characterLimit={100}
        isTextArea={true}
        rows={3}
      />

      <TextInput
        inputId="linkTarget"
        labelText="Item URL"
        value={newLinkTarget}
        setValue={setNewLinkTarget}
        isDisabled={isSaved}
        isRequired={true}
      />
    </div>
  );

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
                    {isPreview ? newCardPreview : editForm}
                    <div className="flex space-x-4 mt-6">
                      <PreviewButton
                        isPreview={isPreview}
                        setIsPreview={setIsPreview}
                      />
                      <SaveButton isSaved={isSaved} onSave={onSave} />
                    </div>
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
