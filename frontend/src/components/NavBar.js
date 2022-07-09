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

import toast from "react-hot-toast";

export default function NavBar() {
  const onLogin = () => {
    toast.error("Login is not implemented yet");
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-800">
      <div className="flex flex-wrap justify-between items-center mx-8 my-4 max-w-screen-xl px-4 md:px-6 py-2.5">
        <a href="https://flowbite.com" className="flex items-center">
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
          <button
            className="text-sm hover:underline"
            onClick={onLogin}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
