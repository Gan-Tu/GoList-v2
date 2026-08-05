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

// This file used to hold ~300 lines of hand-inlined SVG plus a FontAwesome
// dependency (four packages) for a single floppy-disk icon, alongside
// Heroicons. One icon set, imported by name, replaces all of it.

export {
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  CheckIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

/**
 * Heroicons has no spinner, and an animated one is needed in enough places
 * (route fallback, saving states, empty-vs-loading) to be worth defining once.
 */
export function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
