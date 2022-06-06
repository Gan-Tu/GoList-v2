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
import { ItemSnippetView } from "./ItemSnippet";
import { useDispatch } from "react-redux";
import TextInput from "../Utilities/TextInput";
import Modal from "../Utilities/Modal";
import { NewFileIcon, EyeIcon, EyeOffIcon } from "../Utilities/SvgIcons";
import toast from "react-hot-toast";

export default function CreateNewItemModal({ collectionId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [newData, setNewData] = useState({
    title: "No Title",
    imageUrl: "",
    snippet: "No description yet.",
    linkTarget: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);

  useEffect(() => {
    let hasUrl = newData.linkTarget?.length > 0;
    setShowPreview(hasUrl);
    setShowExtraFields(hasUrl);
  }, [newData]);

  const onSave = () => {
    // setIsLoading(true);
    if (!newData.linkTarget?.length) {
      toast.error("URL is required");
    } else {
      dispatch({
        type: "CREATE_ITEM_IN_COLLECTION",
        collectionId,
        itemData: newData,
      });
    }
  };

  return (
    <Modal title="Add New Item" isOpen={isOpen} onClose={onClose}>
      <form className="mt-5">
        <div className="space-y-4">
          {showPreview && (
            <div>
              <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between">
                Card Preview
              </div>
              <div className="sm:py-4 border rounded-lg p-4 mt-4 hover:shadow-lg">
                <a
                  href={newData.linkTarget || null}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ItemSnippetView data={newData} />
                </a>
              </div>
            </div>
          )}

          <TextInput
            inputId="linkTarget"
            labelText="Item URL"
            value={newData.linkTarget}
            setValue={(val) => setNewData({ ...newData, linkTarget: val })}
            isDisabled={isLoading}
            isRequired={true}
          />

          {showExtraFields && (
            <>
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
            </>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            type="button"
            className="flex items-center border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-black"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOffIcon className="w-4 h-4 mr-2" />
            ) : (
              <EyeIcon className="w-4 h-4 mr-2" />
            )}
            {showPreview ? "Hide Preview" : "Preview"}
          </button>

          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center"
            disabled={isLoading}
            onClick={onSave}
          >
            <NewFileIcon className="w-5 h-5 mr-2" /> Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
