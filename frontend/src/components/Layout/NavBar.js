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

import LogInModal from "../Session/LogInModal";
import { useState } from "react";

function NavBar() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const onLogin = () => {
    setSignInModalOpen(true);
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-800">
      <LogInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />
      <div className="flex flex-wrap justify-between items-center m-4 px-6 py-2.5">
        <a type="button" href="/" className="flex items-center">
          <img
            src="/logo192.png"
            className="mr-3 h-6 sm:h-9"
            alt="GoList Logo"
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            GoList
          </span>
        </a>
        <div className="flex items-center">
          <button className="text-sm hover:underline" onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
