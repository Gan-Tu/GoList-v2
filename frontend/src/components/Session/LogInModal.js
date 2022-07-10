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

import { motion } from "framer-motion";
import Modal from "../Utilities/Modal";

function LogInModal({ isOpen, onClose }) {
  return (
    <motion.div layout>
      <Modal title={"Sign In"} isOpen={isOpen} onClose={onClose}>
        <div className="grid grid-cols-1 justify-items-center">
          <ul className="my-4 space-y-3">
            <li>
              <button className="flex px-5 py-3 text-sm text-gray-900 bg-gray-50 rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="mr-3 h-5 "
                  alt="Google Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in with Google
                </span>
              </button>
            </li>
            <li>
              <button className="flex px-5 py-3 text-sm text-white bg-facebook-blue rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
                  className="mr-3 h-5 "
                  alt="Facebook Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in with Facebook
                </span>
              </button>
            </li>
            <li>
              <button className="flex px-5 py-3 text-sm text-white bg-twitter-blue rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/twitter.svg"
                  className="mr-3 h-5 "
                  alt="Twitter Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in with Twitter
                </span>
              </button>
            </li>
            <li>
              <button className="flex px-5 py-3 text-sm text-white bg-github-black rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg"
                  className="mr-3 h-5 "
                  alt="GitHub Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in with GitHub
                </span>
              </button>
            </li>
            <li>
              <button className="flex px-5 py-3 text-sm text-white bg-google-red rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg"
                  className="mr-3 h-5 "
                  alt="Mail Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in with Email
                </span>
              </button>
            </li>
            <li>
              <button className="flex px-5 py-3 text-sm text-white bg-google-yellow rounded-lg">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png"
                  className="mr-3 h-5 "
                  alt="Anonymous Logo"
                />
                <span className="flex-1 ml-3 whitespace-nowrap">
                  Sign in as Guest
                </span>
              </button>
            </li>
          </ul>
        </div>
      </Modal>
    </motion.div>
  );
}

export default LogInModal;
