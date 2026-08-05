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

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ItemSnippetView } from "./ItemSnippet";
import TextInput from "../Utilities/TextInput";
import { EyeIcon, EyeSlashIcon, Spinner } from "../Utilities/SvgIcons";
import { useItemData, useItemIsSaving } from "../../hooks/data";

const FIELDS = ["link", "title", "snippet", "imageUrl"];

function hasChanges(original, draft) {
  return FIELDS.some((field) => (original?.[field] || "") !== (draft?.[field] || ""));
}

export default function ItemEditForm({ itemId, groupId, onSaved, onCancel }) {
  const dispatch = useDispatch();
  const original = useItemData(itemId);
  const isSaving = useItemIsSaving(itemId);

  const [draft, setDraft] = useState(() => ({ ...original }));
  const [showPreview, setShowPreview] = useState(true);
  const submitted = useRef(false);

  // Closes the dialog when the write actually completes, rather than on the
  // fixed 1-second timer the previous version used — which closed the modal
  // whether or not the save had landed.
  useEffect(() => {
    if (submitted.current && !isSaving) {
      submitted.current = false;
      onSaved?.();
    }
  }, [isSaving, onSaved]);

  const update = (field) => (value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const onSubmit = (event) => {
    event.preventDefault();
    if (!hasChanges(original, draft)) {
      onSaved?.();
      return;
    }
    submitted.current = true;
    dispatch({ type: "collections/updateItem", itemId, groupId, data: draft });
  };

  return (
    <form className="mt-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        {showPreview && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">
              Card preview
            </p>
            <div className="rounded-lg border border-gray-200 p-4">
              <ItemSnippetView data={draft} />
            </div>
          </div>
        )}

        <TextInput
          inputId="link"
          labelText="URL"
          value={draft.link}
          setValue={update("link")}
          isDisabled={isSaving}
          isRequired
          placeholder="example.com/article"
        />
        <TextInput
          inputId="title"
          labelText="Title"
          value={draft.title}
          setValue={update("title")}
          isDisabled={isSaving}
          showCharacterCount
          characterLimit={200}
          hint="Leave blank to use the page's own title."
        />
        <TextInput
          inputId="snippet"
          labelText="Description"
          value={draft.snippet}
          setValue={update("snippet")}
          isDisabled={isSaving}
          showCharacterCount
          characterLimit={500}
          isTextArea
          rows={3}
        />
        <TextInput
          inputId="imageUrl"
          labelText="Thumbnail URL"
          value={draft.imageUrl}
          setValue={update("imageUrl")}
          isDisabled={isSaving}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {isSaving && <Spinner className="h-4 w-4" />}
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
          className="ml-auto inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {showPreview ? (
            <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {showPreview ? "Hide preview" : "Show preview"}
        </button>
      </div>
    </form>
  );
}
