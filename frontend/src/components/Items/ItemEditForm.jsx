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

import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { ItemCardView } from "./ItemCard";
import Button from "../Utilities/Button";
import { ModalActions } from "../Utilities/Modal";
import TextInput, { labelClass } from "../Utilities/TextInput";
import { safeHref } from "../Utilities/Helpers";
import { EyeIcon, EyeSlashIcon, TrashIcon } from "../Utilities/SvgIcons";
import { useDraftHasImages, useDraftItem } from "../../hooks/data";

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

/**
 * Only the fields the owner changed in this form. A link added moments ago may
 * still be fetching its preview; sending every field would blank the title
 * that arrives while the form is open.
 */
function changedFields(start, values) {
  const changed = {};
  for (const field of FIELDS) {
    if ((start?.[field] || "") !== (values?.[field] || "")) {
      changed[field] = values[field] || "";
    }
  }
  return changed;
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

/**
 * Edits one link of the edit-mode draft. Done stages the change with the
 * rest of the edit; it is saved (or thrown away) with them.
 */
export default function ItemEditForm({
  itemId,
  groupId,
  onDone,
  onCancel,
  firstFieldRef
}) {
  const dispatch = useDispatch();
  const original = useDraftItem(groupId, itemId);
  const groupHasImages = useDraftHasImages(groupId);
  const fieldId = useId();

  // What the form opened with, to tell the owner's changes from updates
  // (a preview arriving) that happened while it was open.
  const [start] = useState(() => ({ ...original }));
  const [draft, setDraft] = useState(() => ({ ...original }));
  const [showPreview, setShowPreview] = useState(true);
  const previewImageUrl = useSettledValue(draft.imageUrl || "");

  const update = (field) => (value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const hasLink = String(draft.link || "").trim().length > 0;
  const withinLimits =
    (draft.title || "").length <= TITLE_LIMIT &&
    (draft.snippet || "").length <= SNIPPET_LIMIT;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!hasLink || !withinLimits) return;
    const data = changedFields(start, draft);
    if (Object.keys(data).length > 0) {
      dispatch({ type: "collections/draftUpdateItem", groupId, itemId, data });
    }
    onDone?.();
  };

  // No second confirmation: like every edit-mode change it is only staged,
  // and cancelling the edit brings the link back.
  const onRemove = () => {
    dispatch({ type: "collections/draftRemoveItem", groupId, itemId });
    onDone?.();
  };

  // The preview is the grid's own card, in the layout the grid is using, so
  // what you see here is what visitors will see.
  const preview = { ...draft, imageUrl: previewImageUrl };
  const previewLayout =
    groupHasImages || safeHref(previewImageUrl) ? "media" : "compact";

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className={labelClass}>Preview</p>
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2"
            aria-expanded={showPreview}
            onClick={() => setShowPreview((value) => !value)}
          >
            {showPreview ? (
              <EyeSlashIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <EyeIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
            {showPreview ? "Hide" : "Show"}
          </Button>
        </div>
        {showPreview && (
          <div className="rounded-2xl bg-canvas p-4 ring-1 ring-inset ring-hairline sm:px-6">
            <div className="mx-auto max-w-[18rem]">
              <ItemCardView data={preview} layout={previewLayout} preview />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <TextInput
          ref={firstFieldRef}
          inputId={`${fieldId}-link`}
          labelText="URL"
          value={draft.link}
          setValue={update("link")}
          isRequired
          placeholder="example.com/article"
          {...URL_FIELD_PROPS}
        />
        <TextInput
          inputId={`${fieldId}-title`}
          labelText="Title"
          value={draft.title}
          setValue={update("title")}
          showCharacterCount
          characterLimit={TITLE_LIMIT}
          hint="Leave blank to show the site’s name instead."
        />
        <TextInput
          inputId={`${fieldId}-snippet`}
          labelText="Description"
          value={draft.snippet}
          setValue={update("snippet")}
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
          isOptional
          placeholder="example.com/image.png"
          {...URL_FIELD_PROPS}
        />
      </div>

      {/* The destructive action sits apart, at the left on desktop and at
          the bottom of the stack on a phone. */}
      <ModalActions>
        <Button variant="danger-ghost" className="sm:mr-auto" onClick={onRemove}>
          <TrashIcon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Remove link
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!hasLink || !withinLimits}
        >
          Done
        </Button>
      </ModalActions>
    </form>
  );
}
