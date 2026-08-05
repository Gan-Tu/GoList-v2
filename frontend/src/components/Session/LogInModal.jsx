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

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "../Utilities/Modal";
import TextInput from "../Utilities/TextInput";
import { useEmailForSignIn } from "../../hooks/session";

const LOGO_BASE = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth";

// The six near-identical button blocks this replaces differed only in these
// four values.
const PROVIDERS = [
  {
    key: "GOOGLE",
    label: "Continue with Google",
    logo: `${LOGO_BASE}/google.svg`,
    className: "bg-gray-100 text-gray-900 hover:bg-gray-200"
  },
  {
    key: "FACEBOOK",
    label: "Continue with Facebook",
    logo: `${LOGO_BASE}/facebook.svg`,
    className: "bg-facebook-blue text-white hover:opacity-90"
  },
  {
    key: "TWITTER",
    label: "Continue with Twitter",
    logo: `${LOGO_BASE}/twitter.svg`,
    className: "bg-twitter-blue text-white hover:opacity-90"
  },
  {
    key: "GITHUB",
    label: "Continue with GitHub",
    logo: `${LOGO_BASE}/github.svg`,
    className: "bg-github-black text-white hover:opacity-90"
  },
  {
    key: "EMAIL",
    label: "Continue with email",
    logo: `${LOGO_BASE}/mail.svg`,
    className: "bg-google-red text-white hover:opacity-90"
  },
  {
    key: "GUEST",
    label: "Continue as guest",
    logo: `${LOGO_BASE}/anonymous.png`,
    className: "bg-google-green text-white hover:opacity-90"
  }
];

function SignInWithEmailForm({ onCancel, onSignIn }) {
  const [email, setEmail] = useState("");
  const emailForSignIn = useEmailForSignIn();
  const linkSent = Boolean(emailForSignIn);

  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSignIn(email);
      }}
    >
      <TextInput
        inputId="email"
        labelText="Email"
        value={email}
        setValue={setEmail}
        isEmail
        isRequired
        isDisabled={linkSent}
        placeholder="you@example.com"
      />

      {linkSent && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">Check your inbox for a sign-in link.</p>
          <p className="mt-1">If it isn’t there, check your spam folder.</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={linkSent || !email}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Send link
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </form>
  );
}

export default function LogInModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsEmailLogin(false);
  }, [isOpen]);

  const handleLogIn = (loginType) => {
    if (loginType === "EMAIL") {
      setIsEmailLogin(true);
      return;
    }
    dispatch({ type: "session/logIn", loginType });
  };

  return (
    <Modal
      title={isEmailLogin ? "Sign in with email" : "Sign in"}
      isOpen={isOpen}
      onClose={onClose}
    >
      {isEmailLogin ? (
        <SignInWithEmailForm
          onCancel={() => setIsEmailLogin(false)}
          onSignIn={(email) =>
            dispatch({ type: "session/logIn", loginType: "EMAIL", email })
          }
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {PROVIDERS.map((provider) => (
            <li key={provider.key}>
              <button
                type="button"
                onClick={() => handleLogIn(provider.key)}
                className={`flex w-full items-center gap-4 rounded-lg px-5 py-3 text-sm font-medium transition ${provider.className}`}
              >
                <img src={provider.logo} className="h-5 w-5" alt="" />
                <span className="flex-1 whitespace-nowrap text-left">
                  {provider.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
