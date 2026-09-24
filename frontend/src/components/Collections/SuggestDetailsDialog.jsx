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

import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ItemThumbnail } from "../Items/ItemMedia";
import { itemLabel } from "../Items/ItemSnippet";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import { classNames, displayHost, safeHref } from "../Utilities/Helpers";
import { useDraft, useSuggestions } from "../../hooks/data";
import { fillMissing } from "../../state/redux/DataGroups/drafts";

const FIELD_LABELS = { imageUrl: "Image", title: "Title", snippet: "Description" };

/**
 * Reviews the titles, descriptions and images found for links that were
 * missing some. The lookup is started by whoever opens this (it needs the
 * draft's links at that moment); results stream in as each link is checked.
 * Accepted details go into the draft — like every edit-mode change, they are
 * saved with Save or dropped with Cancel.
 */
export default function SuggestDetailsDialog({ groupId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const draft = useDraft(groupId);
  const suggestions = useSuggestions(groupId);
  // Everything found starts out selected; the owner unticks what they don't
  // want. Remounted per lookup (see the caller's key), so this starts empty.
  const [skipped, setSkipped] = useState(() => new Set());

  const loading = suggestions?.status === "loading";
  const total = suggestions?.total || 0;
  const checked = suggestions?.checked || 0;
  const found = suggestions?.found || {};

  const rows = (draft?.itemIds || [])
    .filter((id) => draft.items[id] && found[id])
    .map((id) => ({
      id,
      found: found[id],
      preview: fillMissing(draft.items[id], found[id])
    }));
  const selected = rows.filter((row) => !skipped.has(row.id));
  const nothingFound = !loading && suggestions && rows.length === 0;

  const toggle = (id) =>
    setSkipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSkipped(
      selected.length === rows.length ? new Set(rows.map((row) => row.id)) : new Set()
    );

  const apply = () => {
    const accepted = Object.fromEntries(selected.map((row) => [row.id, row.found]));
    dispatch({ type: "collections/draftApplySuggestions", groupId, accepted });
    const count = selected.length;
    toast.success(
      `Added details to ${count} link${count === 1 ? "" : "s"}. Save to keep them.`
    );
    onClose();
  };

  return (
    <Modal
      title="Fill in missing details"
      description="Titles, descriptions and images from each link’s own page. Pick what to add — nothing changes until you save."
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
    >
      {total > 0 && (
        <div role="status" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3 text-[13px] text-fg-muted">
            <span>
              {loading
                ? `Looking up ${total} link${total === 1 ? "" : "s"}…`
                : rows.length > 0
                  ? `Found details for ${rows.length} of ${total} link${total === 1 ? "" : "s"}`
                  : `Checked ${total} link${total === 1 ? "" : "s"}`}
            </span>
            {loading && (
              <span className="tabular-nums">
                {checked} of {total}
              </span>
            )}
          </div>
          {loading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-smooth"
                style={{ width: `${total ? Math.round((checked / total) * 100) : 0}%` }}
              />
            </div>
          )}
        </div>
      )}

      {nothingFound && (
        <p className="mt-4 rounded-xl bg-subtle p-4 text-sm leading-5 text-fg-muted">
          Nothing new to add. These pages don’t publish a title, description or
          image beyond what the links already have.
        </p>
      )}

      {rows.length > 0 && (
        <>
          {!loading && rows.length > 1 && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selected.length === rows.length ? "Select none" : "Select all"}
              </Button>
            </div>
          )}
          <ul className="mt-2 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
            {rows.map(({ id, found: fields, preview }) => {
              const host = displayHost(preview.link);
              const isSelected = !skipped.has(id);
              return (
                <li key={id} className="animate-fade-in">
                  <label
                    className={classNames(
                      "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors duration-150",
                      "hover:bg-subtle/60",
                      !isSelected && "opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(id)}
                      className="mt-3 h-4 w-4 shrink-0 rounded border-hairline-strong bg-control text-accent focus:ring-2 focus:ring-accent/40 focus:ring-offset-0"
                    />
                    <ItemThumbnail
                      src={safeHref(preview.imageUrl)}
                      seed={host}
                      wide={Boolean(safeHref(preview.imageUrl))}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium leading-5 text-fg [overflow-wrap:anywhere]">
                        {itemLabel(preview)}
                      </p>
                      {preview.snippet && (
                        <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-fg-muted">
                          {preview.snippet}
                        </p>
                      )}
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="sr-only">Adds </span>
                        {Object.keys(FIELD_LABELS)
                          .filter((field) => fields[field])
                          .map((field) => (
                            <span
                              key={field}
                              className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium leading-4 text-accent-fg"
                            >
                              + {FIELD_LABELS[field]}
                            </span>
                          ))}
                        <span className="truncate text-[12px] text-fg-muted">{host}</span>
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ModalActions>
        <Button onClick={onClose}>{nothingFound ? "Close" : "Cancel"}</Button>
        {!nothingFound && (
          <Button
            variant="primary"
            onClick={apply}
            loading={loading}
            disabled={loading || selected.length === 0}
          >
            {loading
              ? "Looking up…"
              : `Add to ${selected.length} link${selected.length === 1 ? "" : "s"}`}
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}
