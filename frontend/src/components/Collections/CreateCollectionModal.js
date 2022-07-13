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
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import TextInput from "../Utilities/TextInput";
import Modal from "../Utilities/Modal";
import { useGroupUpdateStatus } from "../../hooks/data";
import { useNavigate } from "react-router-dom";

const SHORT_URL_REGEX = /^[a-zA-Z0-9-+]*$/;

export default function CreateCollectionModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [shortUrl, setShortUrl] = useState("");
  const [title, setTitle] = useState("");
  const [urls, setUrls] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [urlCount, setUrlCount] = useState(0);

  const status = useGroupUpdateStatus(shortUrl);
  const isUpdating =
    (status?.mode === "create" &&
      status?.dataType === "group" &&
      status?.isUpdating) ||
    false;
  const newGroupId = status?.newGroupId;

  useEffect(() => {
    setUrlCount(
      urls
        .trim()
        .split("\n")
        .filter((x) => x.length > 0).length
    );
  }, [urls]);

  useEffect(() => {
    if (!isUpdating && newGroupId) {
      const timer = setTimeout(() => {
        navigate(`/${newGroupId}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, navigate, isUpdating, newGroupId]);

  const onCreate = () => {
    if (urlCount <= 0) {
      toast.error("Item URLs are empty but required.");
    } else if (urlCount > 10) {
      toast.error("A max of 10 item URLs are allowed per collection.");
    } else if (!title) {
      toast.error("Title is empty but required.");
    } else if (!shortUrl) {
      toast.error("Collection URL is empty but required.");
    } else if (!shortUrl.match(SHORT_URL_REGEX)) {
      toast.error("Only alphanumeric characters, - and + are allowed.");
    } else {
      // dispatch({ type: "CREATE_GROUP", groupId: shortUrl, title, urls });
    }
  };

  let urlCountBadge = null;
  if (urlCount > 10) {
    urlCountBadge = (
      <span className="text-red-500 font-sm">({urlCount}/10 urls)</span>
    );
  } else {
    urlCountBadge = <span className="font-sm">({urlCount}/10 urls)</span>;
  }

  return (
    <motion.div layout>
      <Modal
        title="Create a Collection"
        isOpen={createMode}
        onClose={() => setCreateMode(false)}
      >
        <form className="mt-5">
          <div className="space-y-4">
            <label
              htmlFor="shortUrl"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Collection URL (case sensitive)
            </label>
            <div>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                  https://goli.st/
                </span>
                <input
                  type="text"
                  id="shortUrl"
                  className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder={shortUrl}
                  value={shortUrl}
                  onChange={(e) => setShortUrl(e.target.value)}
                  required={true}
                />
              </div>
              {!shortUrl.match(SHORT_URL_REGEX) && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  Only alphanumeric characters, - and + are allowed.
                </p>
              )}
            </div>

            <TextInput
              inputId="title"
              labelText="Collection Title"
              value={title}
              setValue={setTitle}
              isDisabled={false}
              isRequired={true}
            />
            <label
              htmlFor="urls"
              className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between"
            >
              Item URLs (1 per line)
              {urlCountBadge}
            </label>
            <div className="flex">
              <textarea
                id="urls"
                disabled={false}
                rows={10}
                className="block disabled:text-gray-500 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                required={true}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="text-white bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center"
              disabled={false}
              onClick={onCreate}
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
      <button
        className="w-full text-center text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-small rounded-lg text-sm px-5 py-2.5 dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 mr-2 mb-2"
        onClick={() => setCreateMode(true)}
      >
        Create a Collection
      </button>
    </motion.div>
  );
}
