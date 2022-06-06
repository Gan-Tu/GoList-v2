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

import toast from "react-hot-toast";
import { useState } from "react";
import { useItemData, useItemIsLoading } from "../../hooks/items";
import { ItemSnippetView } from "./ItemSnippet";
import { useDispatch } from "react-redux";
import TextInput from "../Utilities/TextInput";
import Modal from "../Utilities/Modal";
import { SaveIcon, EyeIcon, EyeOffIcon } from "../Utilities/SvgIcons";

function needsUpdate(originalData, newData) {
  return (
    originalData.title !== newData?.title ||
    originalData.snippet !== newData?.snippet ||
    originalData.imageUrl !== newData?.imageUrl ||
    originalData.linkTarget !== newData?.linkTarget
  );
}

export default function ItemEditModal({ itemId, isOpen, onClose }) {
  const originalData = useItemData(itemId);
  const isLoading = useItemIsLoading(itemId);
  const [newData, setNewData] = useState({ ...originalData });
  const [isPreview, setIsPreview] = useState(false);
  const dispatch = useDispatch();

  const onSave = () => {
    if (needsUpdate(originalData, newData)) {
      dispatch({
        type: "UPDATE_ITEM",
        id: itemId,
        data: newData,
      });
    } else {
      toast.success("Nothing to save. No updates made.");
    }
  };

  return (
    <Modal title="Edit Item Details" isOpen={isOpen} onClose={onClose}>
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