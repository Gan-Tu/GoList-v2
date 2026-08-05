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

const FIELD_CLASS =
  "block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 " +
  "placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 " +
  "disabled:bg-gray-50 disabled:text-gray-500";

export default function TextInput({
  inputId,
  labelText,
  value,
  setValue,
  isDisabled,
  isRequired,
  isTextArea,
  isEmail,
  rows,
  placeholder,
  error,
  hint,
  showCharacterCount,
  characterLimit
}) {
  const overLimit = showCharacterCount && (value?.length || 0) > characterLimit;
  const describedBy =
    [error && `${inputId}-error`, hint && `${inputId}-hint`]
      .filter(Boolean)
      .join(" ") || undefined;

  const Field = isTextArea ? "textarea" : "input";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 flex justify-between text-sm font-medium text-gray-900"
      >
        <span>
          {labelText}
          {isRequired && (
            <span className="text-gray-400" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
        {showCharacterCount && (
          <span className={overLimit ? "text-red-600" : "text-gray-500"}>
            {value?.length || 0}/{characterLimit}
          </span>
        )}
      </label>

      <Field
        id={inputId}
        disabled={isDisabled}
        required={isRequired}
        rows={isTextArea ? rows : undefined}
        type={isTextArea ? undefined : isEmail ? "email" : "text"}
        placeholder={placeholder}
        className={`${FIELD_CLASS} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }`}
        value={value ?? ""}
        onChange={(event) => setValue(event.target.value)}
        // Ties the error and hint text to the field so a screen reader
        // announces them instead of leaving the input unexplained.
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
      />

      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
