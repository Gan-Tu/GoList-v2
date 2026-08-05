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
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon
} from "./SvgIcons";

/**
 * Copies the collection's short URL.
 *
 * The product is "share one short URL", but there was no way to actually get
 * that URL out of the app other than selecting the address bar by hand.
 */
export default function CopyLinkButton({ url, className = "" }) {
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
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 ${className}`}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon
          className="w-4 h-4 text-green-600"
          aria-hidden="true"
        />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : "Copy link"}</span>
      {/* Announced to screen readers without moving focus. */}
      <span className="sr-only" role="status">
        {copied ? `${url} copied to clipboard` : ""}
      </span>
    </button>
  );
}
