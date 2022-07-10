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

import Modal from "../Utilities/Modal";
import { TrashIcon } from "../Utilities/SvgIcons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function DeleteCollectionConfirmationModal(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groupId, isOpen, onClose } = props;

  const onDelete = () => {
    dispatch({ type: "DELETE_GROUP", groupId });
    setTimeout(() => {
      onClose();
      navigate("/");
    }, 1500);
  };

  return (
    <Modal title="Are you sure?" isOpen={isOpen} onClose={onClose}>
      <div className="flex-1 items-center text-red-500 dark:text-red-400 min-w-0 mt-4 space-y-2 text-sm font-medium">
        <p>
          You are trying to{" "}
          <b className="font-bold">DELETE THE ENTIRE COLLECTION</b>, including
          all data inside it.
        </p>
        <p>Once you delete, there is no going back.</p>
        <p>Please be certain.</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="inline-flex justify-center text-center items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={onDelete}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Permanently Delete
        </button>
      </div>
    </Modal>
  );
}
