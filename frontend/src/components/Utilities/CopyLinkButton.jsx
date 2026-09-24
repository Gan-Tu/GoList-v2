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

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import { classNames } from "./Helpers";
import { CheckIcon, LinkIcon } from "./SvgIcons";

// Both icons share one cell and cross-fade, so the swap reads as the link
// turning into a check rather than one glyph replacing another.
const ICON_CLASS =
  "col-start-1 row-start-1 h-4 w-4 transition duration-200 ease-smooth";

/**
 * Copies the collection's short URL.
 *
 * The product is "share one short URL", but there was no way to actually get
 * that URL out of the app other than selecting the address bar by hand.
 */
export default function CopyLinkButton({
  url,
  className = "",
  size = "md",
  variant = "secondary"
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const onCopy = async () => {
    try {
      // navigator.clipboard is unavailable on insecure origins and in older
      // browsers, so fall back rather than throwing at the user.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
      }
      setCopied(true);
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={onCopy} className={className}>
        <span className="grid shrink-0" aria-hidden="true">
          <LinkIcon
            className={classNames(
              ICON_CLASS,
              copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
            )}
            strokeWidth={2}
          />
          <CheckIcon
            className={classNames(
              ICON_CLASS,
              "text-success-fg",
              copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
            strokeWidth={2.25}
          />
        </span>
        {/* Both labels occupy the same cell, so the button keeps the width of
            the longer one and nothing beside it shifts when the label swaps.
            The hidden one is also hidden from the accessible name. */}
        <span className="grid">
          <span
            className={classNames("col-start-1 row-start-1", copied && "invisible")}
            aria-hidden={copied || undefined}
          >
            Copy link
          </span>
          <span
            className={classNames("col-start-1 row-start-1", !copied && "invisible")}
            aria-hidden={!copied || undefined}
          >
            Copied
          </span>
        </span>
      </Button>
      {/* Announced to screen readers without moving focus. Kept outside the
          button so the announcement is not folded into its name. */}
      <span className="sr-only" role="status">
        {copied ? `${url} copied to clipboard` : ""}
      </span>
    </>
  );
}
