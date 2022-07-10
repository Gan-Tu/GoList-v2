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
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useEmailForSignIn } from "../../hooks/session";
import Modal from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";

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

function SignInOptionsForm({ handleLogIn }) {
  return (
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
            onClick={() => handleLogIn("EMAIL")}
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
  );
}

function SignInWithEmailForm({ onCancel, onSignIn }) {
  const [email, setEmail] = useState("");
  const [showCheckInbox, setShowCheckInbox] = useState(false);
  const emailForSignIn = useEmailForSignIn();

  useEffect(() => {
    if (emailForSignIn) {
      setShowCheckInbox(true);
    }
  }, [emailForSignIn]);

  return (
    <div className="mt-5">
      <div className="space-y-4">
        <TextInput
          inputId="email"
          labelText="Email"
          value={email}
          isEmail={true}
          setValue={setEmail}
          isDisabled={false}
          isRequired={true}
        />
      </div>
      {showCheckInbox && (
        <div className="space-y-2 pt-5">
          <p className="text-green-500 font-semibold">
            Check your email inbox for a sign-in link!
          </p>
          <p>If you couldn't find the email, check your spam folder.</p>
        </div>
      )}
      <div className="flex gap-1 mt-6">
        <button
          type="button"
          className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={onCancel}
          disabled={showCheckInbox}
        >
          Cancel
        </button>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          disabled={showCheckInbox}
          onClick={() => onSignIn(email)}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function LogInModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  const handleLogIn = (loginType) => {
    if (loginType === "EMAIL") {
      setIsEmailLogin(true);
    } else {
      dispatch({ type: "LOG_IN", loginType });
    }
  };

  const handleEmailLogin = (email) => {
    dispatch({ type: "LOG_IN", loginType: "EMAIL", email });
  };

  return (
    <motion.div layout>
      <Modal
        title={isEmailLogin ? "Sign In With Email" : "Sign In"}
        isOpen={isOpen}
        onClose={onClose}
      >
        {isEmailLogin ? (
          <SignInWithEmailForm
            onCancel={() => setIsEmailLogin(false)}
            onSignIn={handleEmailLogin}
          />
        ) : (
          <SignInOptionsForm handleLogIn={handleLogIn} />
        )}
      </Modal>
    </motion.div>
  );
}

export default LogInModal;
