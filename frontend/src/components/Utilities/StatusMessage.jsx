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

import { classNames } from "./Helpers";

const TONES = {
  neutral: "bg-subtle text-fg-muted",
  accent: "bg-accent-soft text-accent-fg",
  danger: "bg-danger-soft text-danger-fg",
  success: "bg-success-soft text-success-fg"
};

/**
 * The one layout for a page-level state: not found, failed to load, nothing
 * here yet, signed in. They were five slightly different hand-built blocks.
 *
 * `children` is the explanation; `actions` is a row of buttons under it.
 * The title is an <h1> because these states replace the page's content —
 * pass `titleAs="h2"` when one sits inside a page that already has a heading.
 */
export default function StatusMessage({
  icon: Icon,
  tone = "neutral",
  eyebrow,
  title,
  titleAs: Title = "h1",
  children,
  actions,
  className = "",
  ...props
}) {
  return (
    <div
      className={classNames(
        "mx-auto flex w-full max-w-md flex-col items-center py-12 text-center sm:py-16",
        className
      )}
      {...props}
    >
      {Icon && (
        <div
          className={classNames(
            "mb-5 grid h-12 w-12 place-items-center rounded-2xl",
            TONES[tone] || TONES.neutral
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      {eyebrow && (
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-fg-muted">
          {eyebrow}
        </p>
      )}
      <Title className="text-balance text-2xl font-semibold tracking-tight text-fg">
        {title}
      </Title>
      {children && (
        <div className="mt-2 text-pretty text-[15px] leading-6 text-fg-muted">
          {children}
        </div>
      )}
      {actions && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
