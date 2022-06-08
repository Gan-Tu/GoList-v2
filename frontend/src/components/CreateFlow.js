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
import { useDispatch } from "react-redux";
import TextInput from "./Utilities/TextInput";
import Modal from "./Utilities/Modal";
import { NewFileIcon } from "./Utilities/SvgIcons";
import toast from "react-hot-toast";
import { useNewItemId } from "../hooks/items";
import ItemEditForm from "./Items/ItemEditForm";

export default function CreateFlow({ collectionId, isOpen, onClose }) {
  const dispatch = useDispatch();
  // TODO(tugan): Change to loading after submit, and not loading after success/failure
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const itemId = useNewItemId();
  const editMode = itemId?.length > 0;

  const onCreate = () => {
    if (!url) {
      toast.error("URL is empty.");
    } else {
      setIsLoading(true);
      dispatch({ type: "CREATE_ITEM", url, collectionId });
    }
  };

  useEffect(() => {
    if (!itemId) {
      setUrl("");
    }
    setIsLoading(false);
  }, [itemId]);

  return (
    <Modal
      title={editMode ? "Edit Details" : "Add New Item"}
      isOpen={isOpen}
      onClose={onClose}
    >
      {editMode ? (
        <ItemEditForm
          itemId={itemId}
          toastIfNoUpdatesMade={false}
          onSaveCallBack={onClose}
        />
      ) : (
        <form className="mt-5">
          <div className="space-y-4">
            <TextInput
              inputId="url"
              labelText="URL"
              value={url}
              setValue={setUrl}
              isDisabled={isLoading}
              isRequired={true}
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center"
              disabled={isLoading}
              onClick={onCreate}
            >
              <NewFileIcon className="w-5 h-5 mr-2" /> Create
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
