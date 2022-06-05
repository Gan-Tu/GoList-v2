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

import { useEffect, useState } from "react";
import { useItemData } from "../../hooks/items";
import { ItemSnippetView } from "./ItemSnippet";
import { useDispatch } from "react-redux";
import TextInput from "../Utilities/TextInput";
import Modal from "../Utilities/Modal";
import { OkIcon, SaveIcon, EyeIcon, EyeOffIcon } from "../Utilities/SvgIcons";

function SaveButton({ isSaved, onSave }) {
  if (!isSaved) {
    return (
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={onSave}
      >
        <SaveIcon className="w-4 h-4 mr-2" /> Save
      </button>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex justify-center text-center items-center rounded-md border border-transparent bg-green-100 pl-3 pr-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      disabled={true}
    >
      <OkIcon className="w-6 h-6 mr-2" /> Saved
    </button>
  );
}

export default function ItemModal({ itemId, isOpen, onClose }) {
  const originalData = useItemData(itemId);
  const [newData, setNewData] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setNewData(originalData);
  }, [originalData]);

  const onSave = () => {
    setIsSaved(true);
    if (
      originalData.title !== newData.title ||
      originalData.snippet !== newData.snippet ||
      originalData.imageUrl !== newData.imageUrl ||
      originalData.linkTarget !== newData.linkTarget
    ) {
      dispatch({
        type: "UPDATE_ITEM",
        id: itemId,
        data: newData,
      });
    }
    // else add a notification
  };

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

  return (
    <Modal title="Edit Item Details" isOpen={isOpen} onClose={onClose}>
      <form className="mt-5">
        {isPreview ? (
          <div className="sm:py-4 border rounded-lg p-4 mt-4 hover:shadow-lg">
            <a
              href={newData.linkTarget || "#"}
              target="_blank"
              rel="noreferrer"
            >
              <ItemSnippetView data={newData} />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {newData.imageUrl && (
              <div className="flex flex-shrink-0 m-2 justify-center">
                <img
                  className="w-24 h-24 rounded"
                  src={newData.imageUrl}
                  alt="Thumbnail Preview"
                />
              </div>
            )}

            <TextInput
              inputId="imageUrl"
              labelText="Thumbnail Url"
              value={newData.imageUrl}
              setValue={(val) => setNewData({ ...newData, imageUrl: val })}
              isDisabled={isSaved}
              isRequired={true}
            />

            <TextInput
              inputId="title"
              labelText="Item Title"
              value={newData.title}
              setValue={(val) => setNewData({ ...newData, title: val })}
              isDisabled={isSaved}
              isRequired={true}
              showCharacterCount={true}
              characterLimit={40}
            />

            <TextInput
              inputId="snippet"
              labelText="Item Snippet"
              value={newData.snippet}
              setValue={(val) => setNewData({ ...newData, snippet: val })}
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
              value={newData.linkTarget}
              setValue={(val) => setNewData({ ...newData, linkTarget: val })}
              isDisabled={isSaved}
              isRequired={true}
            />
          </div>
        )}
        <div className="flex space-x-4 mt-6">
          <button
            type="button"
            className="flex items-center border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-black"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <EyeOffIcon className="w-4 h-4 mr-2" />
            ) : (
              <EyeIcon className="w-4 h-4 mr-2" />
            )}
            {isPreview ? "Exit Preview" : "Preview"}
          </button>
          <SaveButton isSaved={isSaved} onSave={onSave} />
        </div>
      </form>
    </Modal>
  );
}
