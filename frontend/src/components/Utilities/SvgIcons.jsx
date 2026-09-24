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

// Outline icons are drawn for 24px with a 1.5 stroke. At 16px pass
// strokeWidth={2} (and ~1.75 at 20px) so they keep the same visual weight as
// the text beside them.
export {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpRightIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  LinkIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  PlusIcon,
  QueueListIcon,
  RectangleStackIcon,
  ShareIcon,
  SparklesIcon,
  Squares2X2Icon,
  TrashIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

/** Six-dot drag handle. Heroicons has no grip glyph. */
export function GripVerticalIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  );
}

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
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
