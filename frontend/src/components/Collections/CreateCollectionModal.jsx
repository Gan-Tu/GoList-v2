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

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useDispatch, useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../Utilities/Button";
import Modal, { ModalActions } from "../Utilities/Modal";
import TextInput, {
  errorTextClass,
  fieldClasses,
  hintClass,
  labelClass
} from "../Utilities/TextInput";
import { InformationCircleIcon } from "../Utilities/SvgIcons";
import {
  MAX_URLS_PER_CREATE,
  classNames,
  validateShortUrl
} from "../Utilities/Helpers";
import { useIsCreating, useLastCreatedId } from "../../hooks/data";
import { useAuthResolved, useHasAccount } from "../../hooks/session";

const SHORT_URL_FIELD_SIZES = {
  // Matches fieldClass, including 16px text on phones so iOS does not zoom.
  md: {
    box: "rounded-xl",
    prefix: "pl-3.5 text-base sm:text-sm",
    input: "py-2.5 pr-3.5 text-base sm:text-sm"
  },
  // The landing page's claim field: a pill as tall as a large Button.
  lg: {
    box: "h-11 rounded-full",
    prefix: "pl-4 text-base",
    input: "py-0 pr-4 text-base"
  }
};

/**
 * The "goli.st/" prefix and the input, drawn as one field. The box carries the
 * border and the focus ring (focus-within) and the <input> inside it is bare,
 * so the prefix reads as the start of the value rather than a separate gray
 * segment. Shared by this dialog and the landing page's claim form; extra
 * props (placeholder, onBlur, aria-describedby…) pass through to the input.
 */
export const ShortUrlField = forwardRef(function ShortUrlField(
  { id, value, onChange, invalid = false, size = "md", className = "", ...props },
  ref
) {
  const styles = SHORT_URL_FIELD_SIZES[size] || SHORT_URL_FIELD_SIZES.md;

  return (
    <div
      className={classNames(
        "flex w-full items-center border bg-control shadow-button",
        "transition-[border-color,box-shadow] duration-150 focus-within:ring-4",
        invalid
          ? "border-danger focus-within:border-danger focus-within:ring-danger/20"
          : "border-hairline-strong focus-within:border-accent focus-within:ring-accent/20",
        styles.box,
        className
      )}
    >
      {/* A second <label> for the same input: tapping the prefix focuses the
          field, and a screen reader hears "goli.st/" as part of its name. */}
      <label
        htmlFor={id}
        className={classNames(
          "shrink-0 cursor-text select-none text-fg-muted",
          styles.prefix
        )}
      >
        goli.st/
      </label>
      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // A short URL is an identifier: no capitalised first letter, no
        // "corrections", no red squiggles.
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={invalid ? "true" : undefined}
        className={classNames(
          "min-w-0 flex-1 self-stretch border-0 bg-transparent pl-0 text-fg shadow-none",
          "placeholder:text-fg-subtle focus:outline-none focus:ring-0",
          styles.input
        )}
        {...props}
      />
    </div>
  );
});

/**
 * The create form as a controlled dialog, so a page can open it from its own
 * control. `initialShortUrl` seeds the URL each time the dialog opens — the
 * landing page passes what the visitor already typed, and focus then starts
 * in Title.
 */
export function CreateCollectionDialog({
  isOpen,
  onClose,
  initialShortUrl = ""
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useStore();

  const [shortUrl, setShortUrl] = useState(initialShortUrl);
  const [title, setTitle] = useState("");
  const [urls, setUrls] = useState("");
  const [touched, setTouched] = useState(Boolean(initialShortUrl));

  const shortUrlRef = useRef(null);
  const titleRef = useRef(null);

  // Set once a create succeeds. The fields are cleared on the next open rather
  // than straight away, so the sheet does not blank out while it animates off.
  const [isSpent, setIsSpent] = useState(false);

  // Seeds the URL on every open. Done while rendering rather than in an effect
  // so the dialog's first frame already shows it. An unsent title and links
  // are kept: a draft survives an accidental tap on the backdrop.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      if (isSpent) {
        setShortUrl("");
        setTitle("");
        setUrls("");
        setIsSpent(false);
      }
      if (initialShortUrl) setShortUrl(initialShortUrl);
      // A seeded URL that is invalid shows why straight away.
      setTouched(Boolean(initialShortUrl));
    }
  }

  const hasAccount = useHasAccount();
  const authResolved = useAuthResolved();
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
  const extraLinks = links.length - MAX_URLS_PER_CREATE;
  const linksMessage = tooManyLinks
    ? `Remove ${extraLinks} link${extraLinks === 1 ? "" : "s"}. ` +
      `A new collection can start with up to ${MAX_URLS_PER_CREATE}.`
    : "One per line. Titles and previews fill in on their own.";
  const canSubmit =
    !shortUrlError && title.trim() && links.length > 0 && !tooManyLinks;
  const showShortUrlError = touched && Boolean(shortUrlError);
  const startInTitle =
    Boolean(initialShortUrl) && !validateShortUrl(initialShortUrl);

  // Navigating when the write actually lands, instead of on a timer that
  // fired whether or not creation had succeeded.
  useEffect(() => {
    if (!lastCreatedId) return;
    // Every mounted dialog sees the new id in the same commit — a page's own
    // plus any trigger elsewhere on screen. Each one closes, but only the
    // first to get here consumes the id and navigates; a second navigate
    // would push a duplicate history entry.
    const unclaimed =
      store.getState().collections.lastCreatedId === lastCreatedId;
    if (unclaimed) dispatch({ type: "collections/consumeCreated" });
    // The draft that just became a collection is cleared on the next open.
    if (lastCreatedId === shortUrl) setIsSpent(true);
    onClose?.();
    if (unclaimed) navigate(`/${lastCreatedId}`);
  }, [lastCreatedId, shortUrl, dispatch, navigate, onClose, store]);

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
    <Modal
      title="Create a collection"
      description="Pick a short URL, give it a title, and paste your links."
      isOpen={isOpen}
      // Not dismissable mid-create: the write is already on its way and the
      // page follows it to the new list, so closing would only hide progress.
      onClose={isCreating ? null : onClose}
      initialFocus={startInTitle ? titleRef : shortUrlRef}
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-5">
          <div>
            <label
              htmlFor="shortUrl"
              className={classNames(labelClass, "mb-1.5")}
            >
              Collection URL
            </label>
            <ShortUrlField
              ref={shortUrlRef}
              id="shortUrl"
              value={shortUrl}
              onChange={setShortUrl}
              onBlur={() => setTouched(true)}
              invalid={showShortUrlError}
              placeholder="weekend-reading"
              aria-describedby="shortUrl-help"
              // Locked while the write is in flight: isCreating is keyed by
              // this value, so editing it would drop the guard above.
              readOnly={isCreating}
              required
            />
            <p
              id="shortUrl-help"
              className={showShortUrlError ? errorTextClass : hintClass}
            >
              {showShortUrlError
                ? shortUrlError
                : "Letters, numbers, - and +. At least 6 characters; case sensitive."}
            </p>
          </div>

          <TextInput
            ref={titleRef}
            inputId="title"
            labelText="Title"
            value={title}
            setValue={setTitle}
            isRequired
            placeholder="Weekend reading"
            autoComplete="off"
            readOnly={isCreating}
          />

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor="urls" className={labelClass}>
                Links
              </label>
              {/* Outside the <label>, as in TextInput, so the count is not
                  read out as part of the field's name on every focus. */}
              <span
                className={classNames(
                  "text-[13px] tabular-nums",
                  tooManyLinks ? "font-medium text-danger-fg" : "text-fg-muted"
                )}
              >
                {links.length}/{MAX_URLS_PER_CREATE}
              </span>
            </div>
            <textarea
              id="urls"
              rows={6}
              className={classNames(
                fieldClasses({ invalid: tooManyLinks }),
                "resize-y font-mono"
              )}
              value={urls}
              onChange={(event) => setUrls(event.target.value)}
              placeholder={"example.com/one\nexample.com/two"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="urls-help"
              aria-invalid={tooManyLinks ? "true" : undefined}
              readOnly={isCreating}
              required
            />
            <p
              id="urls-help"
              className={tooManyLinks ? errorTextClass : hintClass}
            >
              {linksMessage}
            </p>
          </div>
        </div>

        {/* Waits for auth to resolve so a signed-in visitor never sees it
            flash. Informational, not a warning: creating works either way. */}
        {authResolved && !hasAccount && (
          <div className="mt-5 flex gap-2.5 rounded-xl bg-subtle p-3 text-[13px] leading-5 text-fg-muted">
            <InformationCircleIcon
              className="mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p>
              You’re not signed in. This collection stays editable in this
              browser; sign in to keep it available everywhere.
            </p>
          </div>
        )}

        <ModalActions>
          <Button onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isCreating}
            disabled={!canSubmit}
          >
            {isCreating ? "Creating…" : "Create collection"}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

/**
 * A button that opens the create dialog. With no props it is the primary
 * "Create a collection" button; `icon` takes an icon component (PlusIcon).
 */
export default function CreateCollectionModal({
  label = "Create a collection",
  variant = "primary",
  size,
  icon: Icon,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Stable, so the dialog's navigate-on-create effect does not re-run on
  // every render of the page around it.
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
        {label}
      </Button>
      <CreateCollectionDialog isOpen={isOpen} onClose={close} />
    </>
  );
}
