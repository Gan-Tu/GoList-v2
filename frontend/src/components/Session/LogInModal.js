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
import { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "../Utilities/Modal";

function LogInButton({ logo, textColor, bgColor, buttonText, onClick }) {
  return (
    <button
      style={{ minWidth: "225px" }}
      className={`flex pl-5 py-3 gap-4 text-justify text-sm font-medium rounded-lg hover:shadow-lg ${textColor} ${bgColor}`}
      onClick={onClick}
    >
      <img src={logo} className="h-5 w-5" alt="Logo" />
      <span className="flex-1 whitespace-nowrap">{buttonText}</span>
    </button>
  );
}

function LogInModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isEmailLogin, setIsEmailLogin] = useState(true);

  const handleLogIn = (loginType) => {
    dispatch({ type: "LOG_IN", loginType });
  };

  return (
    <motion.div layout>
      <Modal
        title={"Sign in with Email"}
        isOpen={isEmailLogin}
        onClose={() => setIsEmailLogin(false)}
      >
        <p>Hi</p>
      </Modal>
      <Modal title={"Sign In"} isOpen={isOpen} onClose={onClose}>
        <div className="grid grid-cols-1 justify-items-center">
          <ul className="my-5 space-y-3">
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                }
                textColor="text-gray-900"
                bgColor="bg-gray-100"
                buttonText="Sign in with Google"
                onClick={() => handleLogIn("GOOGLE")}
              />
            </li>
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
                }
                textColor="text-white"
                bgColor="bg-facebook-blue"
                buttonText="Sign in with Facebook"
                onClick={() => handleLogIn("FACEBOOK")}
              />
            </li>
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/twitter.svg"
                }
                textColor="text-white"
                bgColor="bg-twitter-blue"
                buttonText="Sign in with Twitter"
                onClick={() => handleLogIn("TWITTER")}
              />
            </li>
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg"
                }
                textColor="text-white"
                bgColor="bg-github-black"
                buttonText="Sign in with GitHub"
                onClick={() => handleLogIn("GITHUB")}
              />
            </li>
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg"
                }
                textColor="text-white"
                bgColor="bg-google-red"
                buttonText="Sign in with Email"
                onClick={() => setIsEmailLogin(true)}
              />
            </li>
            <li>
              <LogInButton
                logo={
                  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png"
                }
                textColor="text-white"
                bgColor="bg-google-green"
                buttonText="Sign in as Guest"
                onClick={() => handleLogIn("GUEST")}
              />
            </li>
          </ul>
        </div>
      </Modal>
    </motion.div>
  );
}

export default LogInModal;
