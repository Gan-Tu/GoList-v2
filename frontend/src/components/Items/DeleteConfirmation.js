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

import ItemSnippet from "./ItemSnippet";
import Modal from "../Utilities/Modal";
import toast from "react-hot-toast";
import { TrashIcon } from "../Utilities/SvgIcons";

export default function DeleteConfirmation({ itemId, isOpen, onClose }) {
  return (
    <Modal
      title="Are you sure you want to delete?"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="sm:py-4 border rounded-lg p-4 mt-4">
        <ItemSnippet id={itemId} />
      </div>

      <div className="flex-1 items-center ml-1 mt-2 min-w-0 mt-4 text-sm font-medium text-red-500 dark:text-red-400 w-80">
        <p>Once you delete, there is no going back.</p>
        <p>Please be certain.</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="inline-flex justify-center text-center items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={() => toast.error("Delete is Unimplemented!")}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Permanently Delete
        </button>
      </div>
    </Modal>
  );
}
