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

import { classNames } from "../Utilities/Helpers";
import { QueueListIcon, Squares2X2Icon } from "../Utilities/SvgIcons";

// List first: it is the default, and the denser way to skim a collection.
const OPTIONS = [
  { value: "list", label: "List view", Icon: QueueListIcon },
  { value: "grid", label: "Gallery view", Icon: Squares2X2Icon }
];

/**
 * A two-way segmented control: the current layout sits on a raised thumb.
 *
 * Each option is a toggle button (aria-pressed) rather than a radio group, so
 * it works with Tab and Enter like every other button on the page, and a
 * screen reader hears "List view, toggle button, pressed".
 *
 * The thumb is lighter than its track in both themes — white on gray, gray on
 * near-black — which is why it is the one place with a `dark:` color.
 */
export default function ViewToggle({ value, onChange, className = "" }) {
  return (
    <div
      role="group"
      aria-label="Layout"
      className={classNames(
        "inline-flex rounded-full bg-subtle p-0.5 ring-1 ring-inset ring-hairline dark:bg-canvas",
        className
      )}
    >
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            title={label}
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={classNames(
              "grid h-8 w-9 place-items-center rounded-full",
              "transition-[background-color,color,box-shadow] duration-150 ease-smooth",
              selected
                ? "bg-surface text-fg shadow-button ring-1 ring-hairline dark:bg-subtle"
                : "text-fg-muted hover:text-fg"
            )}
          >
            <span className="sr-only">{label}</span>
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
