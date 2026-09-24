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
import toast from "react-hot-toast";
import { ItemThumbnail } from "../Items/ItemMedia";
import { itemLabel } from "../Items/ItemSnippet";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import { classNames, displayHost, safeHref } from "../Utilities/Helpers";
import { ArrowPathIcon, PlusIcon } from "../Utilities/SvgIcons";
import { useDraft, useSuggestions } from "../../hooks/data";
import { applyDetails, detailChanges } from "../../state/redux/DataGroups/drafts";

const FIELD_LABELS = { imageUrl: "image", title: "title", snippet: "description" };

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
const keyOf = (itemId, field) => `${itemId}|${field}`;

/** A checkbox that can also show "some of these", which only JS can set. */
function RowCheckbox({ id, checked, indeterminate, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-3 h-4 w-4 shrink-0 rounded border-hairline-strong bg-control text-accent focus:ring-2 focus:ring-accent/40 focus:ring-offset-0"
    />
  );
}

/**
 * Reviews what each link's page says about it now, against what the link
 * has: details to add where it has none, and to replace where they differ.
 * Every change can be taken or left on its own — the fresh image without the
 * page's title in place of one the owner wrote, say — and the row shows the
 * result as they choose.
 *
 * The lookup is started by whoever opens this (it needs the draft's links at
 * that moment); results stream in as each link is checked. Accepted details
 * go into the draft, saved with Save or dropped with Cancel like every other
 * edit-mode change.
 */
export default function SuggestDetailsDialog({ groupId, isOpen, onClose }) {
  const dispatch = useDispatch();
  const draft = useDraft(groupId);
  const suggestions = useSuggestions(groupId);
  // Every change starts out selected; the owner unticks what to leave alone.
  // Remounted per lookup (see the caller's key), so this starts empty.
  const [skipped, setSkipped] = useState(() => new Set());

  const loading = suggestions?.status === "loading";
  const total = suggestions?.total || 0;
  const checked = suggestions?.checked || 0;
  const found = suggestions?.found || {};

  const rows = (draft?.itemIds || [])
    .filter((id) => draft.items[id] && found[id])
    .map((id) => ({ id, item: draft.items[id], changes: detailChanges(draft.items[id], found[id]) }))
    .filter((row) => row.changes.length > 0);

  const allKeys = rows.flatMap((row) => row.changes.map((change) => keyOf(row.id, change.field)));
  const selectedCount = allKeys.filter((key) => !skipped.has(key)).length;
  const upToDate = !loading && suggestions && rows.length === 0;

  const setKeys = (keys, selected) =>
    setSkipped((current) => {
      const next = new Set(current);
      for (const key of keys) {
        if (selected) next.delete(key);
        else next.add(key);
      }
      return next;
    });

  const apply = () => {
    const accepted = {};
    for (const row of rows) {
      const fields = {};
      for (const change of row.changes) {
        if (!skipped.has(keyOf(row.id, change.field))) fields[change.field] = change.to;
      }
      if (Object.keys(fields).length > 0) accepted[row.id] = fields;
    }
    dispatch({ type: "collections/draftApplySuggestions", groupId, accepted });
    const links = Object.keys(accepted).length;
    toast.success(`Updated ${plural(links, "link")}. Save to keep the changes.`);
    onClose();
  };

  return (
    <Modal
      title="Fill in details"
      description="Each link’s own page, checked again. Pick what to add or replace — nothing changes until you save."
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
    >
      {total > 0 && (
        <div role="status" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3 text-[13px] text-fg-muted">
            <span>
              {loading
                ? `Looking up ${plural(total, "link")}…`
                : rows.length > 0
                  ? `Found ${plural(allKeys.length, "change")} for ${plural(rows.length, "link")}`
                  : `Checked ${plural(total, "link")}`}
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

      {upToDate && (
        <p className="mt-4 rounded-xl bg-subtle p-4 text-sm leading-5 text-fg-muted">
          Everything already matches. Each link’s title, description and image
          are what its page gives today.
        </p>
      )}

      {rows.length > 0 && (
        <>
          {!loading && allKeys.length > 1 && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKeys(allKeys, selectedCount < allKeys.length)}
              >
                {selectedCount === allKeys.length ? "Select none" : "Select all"}
              </Button>
            </div>
          )}
          <ul className="mt-2 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
            {rows.map(({ id, item, changes }) => {
              const keys = changes.map((change) => keyOf(id, change.field));
              const chosen = changes.filter((change) => !skipped.has(keyOf(id, change.field)));
              // The row shows the link as it would be with the chosen changes.
              const preview = applyDetails(
                item,
                Object.fromEntries(chosen.map((change) => [change.field, change.to]))
              );
              const replaced = (field) =>
                chosen.find((change) => change.field === field && change.kind === "replace");
              const host = displayHost(preview.link);
              const checkboxId = `suggest-${id}`;

              return (
                <li
                  key={id}
                  className={classNames(
                    "flex animate-fade-in items-start gap-3 px-4 py-3 transition-opacity duration-150",
                    chosen.length === 0 && "opacity-60"
                  )}
                >
                  <RowCheckbox
                    id={checkboxId}
                    checked={chosen.length === changes.length}
                    indeterminate={chosen.length > 0 && chosen.length < changes.length}
                    onChange={() => setKeys(keys, chosen.length < changes.length)}
                  />
                  <label htmlFor={checkboxId} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <ItemThumbnail
                      src={safeHref(preview.imageUrl)}
                      seed={host}
                      wide={Boolean(safeHref(preview.imageUrl))}
                    />
                    <span className="block min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium leading-5 text-fg [overflow-wrap:anywhere]">
                        {itemLabel(preview)}
                      </span>
                      {replaced("title") && (
                        <span className="line-clamp-1 text-[12px] leading-4 text-fg-muted line-through">
                          {replaced("title").from}
                        </span>
                      )}
                      {preview.snippet && (
                        <span className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-fg-muted">
                          {preview.snippet}
                        </span>
                      )}
                      {replaced("snippet") && (
                        <span className="line-clamp-1 text-[12px] leading-4 text-fg-muted line-through">
                          {replaced("snippet").from}
                        </span>
                      )}
                      <span className="mt-0.5 block truncate text-[12px] leading-4 text-fg-muted">
                        {host}
                      </span>
                    </span>
                  </label>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 self-center">
                    {changes.map((change) => {
                      const key = keyOf(id, change.field);
                      const on = !skipped.has(key);
                      const Icon = change.kind === "add" ? PlusIcon : ArrowPathIcon;
                      const verb = change.kind === "add" ? "Add" : "Replace";
                      return (
                        <button
                          key={change.field}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setKeys([key], !on)}
                          className={classNames(
                            "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-medium leading-4",
                            "transition-colors duration-150",
                            on
                              ? "bg-accent-soft text-accent-fg"
                              : "text-fg-muted ring-1 ring-inset ring-hairline-strong hover:text-fg"
                          )}
                        >
                          <Icon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                          {verb} {FIELD_LABELS[change.field]}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ModalActions>
        <Button onClick={onClose}>{upToDate ? "Close" : "Cancel"}</Button>
        {!upToDate && (
          <Button
            variant="primary"
            onClick={apply}
            loading={loading}
            disabled={loading || selectedCount === 0}
          >
            {loading ? "Looking up…" : `Apply ${plural(selectedCount, "change")}`}
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}
