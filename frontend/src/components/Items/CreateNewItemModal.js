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

import { useState } from "react";
import { ItemSnippetView } from "./ItemSnippet";
import { useDispatch } from "react-redux";
import TextInput from "../Utilities/TextInput";
import Modal from "../Utilities/Modal";
import { SaveIcon, EyeIcon, EyeOffIcon } from "../Utilities/SvgIcons";

export default function CreateNewItemModal({ collectionId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [newData, setNewData] = useState({
    title: "No Title",
    imageUrl: "",
    snippet: "",
    linkTarget: "",
  });
  const [isPreview, setIsPreview] = useState(false);

  const onSave = () => {
    setIsLoading(true);
    dispatch({
      type: "CREATE_ITEM_IN_COLLECTION",
      collectionId,
      data: newData,
    });
  };

  return (
    <Modal title="Create New Item" isOpen={isOpen} onClose={onClose}>
      <form className="mt-5">
        {isPreview ? (
          <div className="sm:py-4 border rounded-lg p-4 mt-4 hover:shadow-lg">
            <a
              href={newData.linkTarget || null}
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
              isDisabled={isLoading}
              isRequired={true}
            />

            <TextInput
              inputId="title"
              labelText="Item Title"
              value={newData.title}
              setValue={(val) => setNewData({ ...newData, title: val })}
              isDisabled={isLoading}
              isRequired={true}
              showCharacterCount={true}
              characterLimit={40}
            />

            <TextInput
              inputId="snippet"
              labelText="Item Snippet"
              value={newData.snippet}
              setValue={(val) => setNewData({ ...newData, snippet: val })}
              isDisabled={isLoading}
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
              isDisabled={isLoading}
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

          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center"
            disabled={isLoading}
            onClick={onSave}
          >
            <SaveIcon className="w-4 h-4 mr-2" /> Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
