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

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";
import { Spinner } from "../Utilities/SvgIcons";
import { MAX_URLS_PER_CREATE, validateShortUrl } from "../Utilities/Helpers";
import { useIsCreating, useLastCreatedId } from "../../hooks/data";
import { useHasAccount } from "../../hooks/session";

export default function CreateCollectionModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [title, setTitle] = useState("");
  const [urls, setUrls] = useState("");
  const [touched, setTouched] = useState(false);

  const hasAccount = useHasAccount();
  const isCreating = useIsCreating(shortUrl);
  const lastCreatedId = useLastCreatedId();

  // Derived rather than stored in state via an effect — the old version kept
  // urlCount and the validation message in useState and recomputed them in two
  // separate effects on every keystroke.
  const links = useMemo(
    () =>
      urls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [urls]
  );
  const shortUrlError = validateShortUrl(shortUrl);
  const tooManyLinks = links.length > MAX_URLS_PER_CREATE;
  const canSubmit =
    !shortUrlError && title.trim() && links.length > 0 && !tooManyLinks;

  // Navigating when the write actually lands, instead of on a timer that
  // fired whether or not creation had succeeded.
  useEffect(() => {
    if (!lastCreatedId) return;
    dispatch({ type: "collections/consumeCreated" });
    setIsOpen(false);
    navigate(`/${lastCreatedId}`);
  }, [lastCreatedId, dispatch, navigate]);

  const onSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    dispatch({
      type: "collections/create",
      groupId: shortUrl,
      title,
      urls
    });
  };

  return (
    <>
      <Modal
        title="Create a collection"
        isOpen={isOpen}
        onClose={isCreating ? null : () => setIsOpen(false)}
      >
        <form className="mt-5" onSubmit={onSubmit}>
          {!hasAccount && (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              You’re not signed in. This collection stays editable in this
              browser, but signing in keeps it available everywhere.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="shortUrl"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Collection URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                  goli.st/
                </span>
                <input
                  id="shortUrl"
                  type="text"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 p-2.5 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  value={shortUrl}
                  onChange={(event) => setShortUrl(event.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="my-reading-list"
                  autoComplete="off"
                  aria-describedby="shortUrl-help"
                  aria-invalid={touched && shortUrlError ? "true" : undefined}
                  required
                />
              </div>
              <p
                id="shortUrl-help"
                className={`mt-2 text-sm ${
                  touched && shortUrlError ? "text-red-600" : "text-gray-500"
                }`}
              >
                {touched && shortUrlError
                  ? shortUrlError
                  : "Letters, numbers, - and +. Case sensitive, 6 characters or more."}
              </p>
            </div>

            <TextInput
              inputId="title"
              labelText="Title"
              value={title}
              setValue={setTitle}
              isRequired
              placeholder="Weekend reading"
            />

            <div>
              <label
                htmlFor="urls"
                className="mb-2 flex justify-between text-sm font-medium text-gray-900"
              >
                <span>Links, one per line</span>
                <span className={tooManyLinks ? "text-red-600" : "text-gray-500"}>
                  {links.length}/{MAX_URLS_PER_CREATE}
                </span>
              </label>
              <textarea
                id="urls"
                rows={8}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                value={urls}
                onChange={(event) => setUrls(event.target.value)}
                placeholder={"example.com/one\nexample.com/two"}
                required
              />
              {tooManyLinks && (
                <p className="mt-2 text-sm text-red-600">
                  Remove {links.length - MAX_URLS_PER_CREATE} link
                  {links.length - MAX_URLS_PER_CREATE === 1 ? "" : "s"} — a
                  collection can hold up to {MAX_URLS_PER_CREATE}.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit || isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isCreating && <Spinner className="h-4 w-4" />}
              {isCreating ? "Creating…" : "Create collection"}
            </button>
          </div>
        </form>
      </Modal>

      <button
        type="button"
        className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        onClick={() => setIsOpen(true)}
      >
        Create a collection
      </button>
    </>
  );
}
