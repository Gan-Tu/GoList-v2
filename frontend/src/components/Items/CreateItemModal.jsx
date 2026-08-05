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
import Modal from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";

export default function CreateItemModal({ groupId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [url, setUrl] = useState("");

  // Reset between openings so a previously typed URL is not still sitting
  // there the next time the dialog appears.
  useEffect(() => {
    if (isOpen) setUrl("");
  }, [isOpen]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!url.trim()) return;
    dispatch({ type: "collections/createItem", groupId, url });
    onClose();
  };

  return (
    <Modal title="Add a link" isOpen={isOpen} onClose={onClose}>
      <form className="mt-5" onSubmit={onSubmit}>
        <TextInput
          inputId="new-item-url"
          labelText="URL"
          value={url}
          setValue={setUrl}
          isRequired
          placeholder="example.com/article"
          hint="The title, description and thumbnail are filled in automatically."
        />
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={!url.trim()}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Add link
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
