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

import { forwardRef } from "react";
import { classNames } from "./Helpers";

// Text is 16px below `sm` on purpose: iOS Safari zooms the whole page into any
// focused field smaller than that, and does not zoom back out.
const FIELD_BASE =
  "block w-full rounded-xl border bg-control px-3.5 py-2.5 " +
  "text-base text-fg shadow-button placeholder:text-fg-subtle " +
  "transition-[border-color,box-shadow] duration-150 " +
  "focus:outline-none focus:ring-4 " +
  "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-fg-muted sm:text-sm";

const FIELD_TONES = {
  default: "border-hairline-strong focus:border-accent focus:ring-accent/20",
  // A destructive confirmation: neutral at rest, red once it has focus.
  danger: "border-hairline-strong focus:border-danger focus:ring-danger/20",
  invalid: "border-danger focus:border-danger focus:ring-danger/20"
};

/**
 * The classes for a text field, for fields that cannot use <TextInput> — the
 * goli.st/ prefixed URL input, the inline title editor.
 *
 * Exactly one set of border and ring colors comes out. Two utilities of the
 * same kind on one element are settled by their order in the generated
 * stylesheet, not by their order in `class`, so "base classes plus an error
 * override" silently kept the gray border in the production build.
 */
export function fieldClasses({ invalid = false, tone = "default" } = {}) {
  return `${FIELD_BASE} ${FIELD_TONES[invalid ? "invalid" : tone] || FIELD_TONES.default}`;
}

export const fieldClass = fieldClasses();

export const labelClass = "block text-[13px] font-medium text-fg";
export const hintClass = "mt-1.5 text-[13px] leading-5 text-fg-muted";
export const errorTextClass = "mt-1.5 text-[13px] leading-5 text-danger-fg";

/**
 * A labelled text field. Extra props (autoComplete, inputMode, onBlur…) pass
 * through to the <input>/<textarea>, and the ref lands on it too.
 */
const TextInput = forwardRef(function TextInput(
  {
    inputId,
    labelText,
    value,
    setValue,
    isDisabled,
    isRequired,
    isOptional,
    isTextArea,
    isEmail,
    rows,
    placeholder,
    error,
    hint,
    showCharacterCount,
    characterLimit,
    className = "",
    ...props
  },
  ref
) {
  const length = value?.length || 0;
  const overLimit = showCharacterCount && length > characterLimit;
  // Only ids that are actually rendered — the hint is replaced by the error.
  const describedBy =
    [error && `${inputId}-error`, hint && !error && `${inputId}-hint`]
      .filter(Boolean)
      .join(" ") || undefined;

  const Field = isTextArea ? "textarea" : "input";

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className={labelClass}>
          {labelText}
        </label>
        {/* Kept outside the <label> so the count is not read out as part of
            the field's name on every focus. */}
        {showCharacterCount ? (
          <span
            className={classNames(
              "text-[13px] tabular-nums",
              overLimit ? "font-medium text-danger-fg" : "text-fg-muted"
            )}
          >
            {length}/{characterLimit}
          </span>
        ) : isOptional ? (
          <span className="text-[13px] text-fg-muted">Optional</span>
        ) : null}
      </div>

      <Field
        ref={ref}
        id={inputId}
        disabled={isDisabled}
        required={isRequired}
        rows={isTextArea ? rows : undefined}
        type={isTextArea ? undefined : isEmail ? "email" : "text"}
        placeholder={placeholder}
        className={classNames(
          fieldClasses({ invalid: Boolean(error) }),
          isTextArea && "resize-y"
        )}
        value={value ?? ""}
        onChange={(event) => setValue(event.target.value)}
        // Ties the error and hint text to the field so a screen reader
        // announces them instead of leaving the input unexplained.
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  );
});

export default TextInput;
