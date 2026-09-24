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

import { useEffect, useId, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ItemCardView } from "./ItemCard";
import Button from "../Utilities/Button";
import { ModalActions } from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";
import { safeHref } from "../Utilities/Helpers";
import { EyeIcon, EyeSlashIcon } from "../Utilities/SvgIcons";
import {
  useGroupHasImages,
  useItemData,
  useItemIsSaving
} from "../../hooks/data";

const FIELDS = ["link", "title", "snippet", "imageUrl"];
const TITLE_LIMIT = 200;
const SNIPPET_LIMIT = 500;

// Typed URLs should not autocorrect, capitalize or spell-check, and phones
// should offer the keyboard with "/" and ".com" on it.
const URL_FIELD_PROPS = {
  inputMode: "url",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
  autoComplete: "off"
};

function hasChanges(original, draft) {
  return FIELDS.some((field) => (original?.[field] || "") !== (draft?.[field] || ""));
}

/**
 * The thumbnail URL is typed a character at a time; previewing each partial
 * URL would fire a request for every keystroke. The preview follows once
 * typing pauses.
 */
function useSettledValue(value, delay = 400) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

export default function ItemEditForm({
  itemId,
  groupId,
  onSaved,
  onCancel,
  firstFieldRef
}) {
  const dispatch = useDispatch();
  const original = useItemData(itemId);
  const isSaving = useItemIsSaving(itemId);
  const groupHasImages = useGroupHasImages(groupId);
  const fieldId = useId();

  const [draft, setDraft] = useState(() => ({ ...original }));
  const [showPreview, setShowPreview] = useState(true);
  const submitted = useRef(false);
  const previewImageUrl = useSettledValue(draft.imageUrl || "");

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

  const hasLink = String(draft.link || "").trim().length > 0;
  const withinLimits =
    (draft.title || "").length <= TITLE_LIMIT &&
    (draft.snippet || "").length <= SNIPPET_LIMIT;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!hasLink || !withinLimits) return;
    if (!hasChanges(original, draft)) {
      onSaved?.();
      return;
    }
    submitted.current = true;
    dispatch({ type: "collections/updateItem", itemId, groupId, data: draft });
  };

  // The preview is the grid's own card, in the layout the grid is using, so
  // what you see here is what visitors will see.
  const preview = { ...draft, imageUrl: previewImageUrl };
  const previewLayout =
    groupHasImages || safeHref(previewImageUrl) ? "media" : "compact";

  return (
    <form onSubmit={onSubmit}>
      {showPreview && (
        <div className="mb-6 rounded-2xl bg-canvas p-4 ring-1 ring-inset ring-hairline sm:px-6">
          <div className="mx-auto max-w-[18rem]">
            <ItemCardView data={preview} layout={previewLayout} preview />
          </div>
        </div>
      )}

      <div className="space-y-5">
        <TextInput
          ref={firstFieldRef}
          inputId={`${fieldId}-link`}
          labelText="URL"
          value={draft.link}
          setValue={update("link")}
          isDisabled={isSaving}
          isRequired
          placeholder="example.com/article"
          {...URL_FIELD_PROPS}
        />
        <TextInput
          inputId={`${fieldId}-title`}
          labelText="Title"
          value={draft.title}
          setValue={update("title")}
          isDisabled={isSaving}
          showCharacterCount
          characterLimit={TITLE_LIMIT}
          hint="Leave blank to show the site’s name instead."
        />
        <TextInput
          inputId={`${fieldId}-snippet`}
          labelText="Description"
          value={draft.snippet}
          setValue={update("snippet")}
          isDisabled={isSaving}
          showCharacterCount
          characterLimit={SNIPPET_LIMIT}
          isTextArea
          rows={3}
        />
        <TextInput
          inputId={`${fieldId}-image`}
          labelText="Thumbnail URL"
          value={draft.imageUrl}
          setValue={update("imageUrl")}
          isDisabled={isSaving}
          isOptional
          placeholder="example.com/image.png"
          {...URL_FIELD_PROPS}
        />
      </div>

      <ModalActions>
        <Button
          variant="ghost"
          className="sm:mr-auto"
          onClick={() => setShowPreview((value) => !value)}
        >
          {showPreview ? (
            <EyeSlashIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          )}
          {showPreview ? "Hide preview" : "Show preview"}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSaving}
          disabled={!hasLink || !withinLimits}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </ModalActions>
    </form>
  );
}
