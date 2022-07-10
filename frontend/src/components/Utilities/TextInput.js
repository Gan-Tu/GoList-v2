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

export default function TextInput(props) {
  const { inputId, labelText } = props;
  const { value, setValue } = props;
  const { isDisabled, isRequired } = props;
  const { showCharacterCount, characterLimit } = props;
  const { isTextArea, isEmail, rows } = props;

  let charCount = null;
  if (showCharacterCount) {
    if (value?.length > characterLimit) {
      charCount = (
        <span className="text-red-500 font-sm">
          ({value?.length || 0}/{characterLimit} characters)
        </span>
      );
    } else {
      charCount = (
        <span className="text-gray-500 font-sm">
          ({value?.length || 0}/{characterLimit} characters)
        </span>
      );
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex justify-between"
      >
        {labelText} {charCount}
      </label>

      {isTextArea ? (
        <textarea
          id={inputId}
          disabled={isDisabled}
          rows={rows}
          className="block disabled:text-gray-500 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={isRequired}
        />
      ) : (
        <input
          id={inputId}
          disabled={isDisabled}
          type={isEmail ? "email" : "text"}
          className="shadow-sm disabled:text-gray-500 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={isRequired}
        />
      )}
    </div>
  );
}
