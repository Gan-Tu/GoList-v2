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

import { LoaderIcon } from "../Utilities/SvgIcons";

export default function VerifyEmail() {
  return (
    <button
      disabled
      type="button"
      className="py-2.5 px-5 mr-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-400 inline-flex items-center"
    >
      <LoaderIcon className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600" />
      Verifying...
    </button>
  );
}
