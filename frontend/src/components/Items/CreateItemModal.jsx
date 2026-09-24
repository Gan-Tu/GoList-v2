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
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";
import { MAX_ITEMS_PER_COLLECTION, safeHref } from "../Utilities/Helpers";
import { useItemIds } from "../../hooks/data";

/**
 * Whether the input plausibly names a web page. safeHref alone is too
 * lenient here — browsers happily parse "not a url" into
 * https://not%20a%20url/ — so this also wants no spaces and a dotted host.
 */
function isWebAddress(value) {
  const href = safeHref(value);
  if (!href || /\s/.test(value.trim())) return false;
  const { hostname } = new URL(href);
  return hostname === "localhost" || hostname.includes(".");
}

export default function CreateItemModal({ groupId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const itemCount = useItemIds(groupId).length;
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Reset between openings so a previously typed URL is not still sitting
  // there the next time the dialog appears.
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setTouched(false);
    }
  }, [isOpen]);

  // The rules cap a collection at 50 links; saying so up front beats a
  // generic "Could not add that link" after the write is refused.
  const isFull = itemCount >= MAX_ITEMS_PER_COLLECTION;
  const isValid = isWebAddress(url);
  const showInvalid = touched && url.trim().length > 0 && !isValid;

  const onSubmit = (event) => {
    event.preventDefault();
    if (isFull || !isValid) {
      setTouched(true);
      return;
    }
    dispatch({ type: "collections/createItem", groupId, url });
    onClose();
  };

  return (
    <Modal
      title="Add a link"
      description="We’ll fill in the title, description and thumbnail."
      isOpen={isOpen}
      onClose={onClose}
      initialFocus={inputRef}
    >
      <form onSubmit={onSubmit}>
        <TextInput
          ref={inputRef}
          inputId="new-item-url"
          labelText="URL"
          value={url}
          setValue={setUrl}
          onBlur={() => setTouched(true)}
          isRequired
          placeholder="example.com/article"
          error={
            isFull
              ? `This collection is full — it holds up to ${MAX_ITEMS_PER_COLLECTION} links.`
              : showInvalid
                ? "Enter a web address, like example.com/article."
                : undefined
          }
          // Typed URLs should not autocorrect, capitalize or spell-check, and
          // phones should offer the keyboard with "/" and ".com" on it.
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
        />
        <ModalActions>
          <Button onClick={onClose}>Cancel</Button>
          {/* Enabled for any typed text: submitting a malformed address is
              what reveals the error, where a disabled button (and a dead
              Enter key) would just say nothing. */}
          <Button type="submit" variant="primary" disabled={isFull || !url.trim()}>
            Add link
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
