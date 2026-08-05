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
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../Utilities/TextInput";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  Spinner
} from "../Utilities/SvgIcons";
import {
  useDocumentTitle,
  useEmailVerificationStatus
} from "../../hooks/session";

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useEmailVerificationStatus();
  const [email, setEmail] = useState("");

  useDocumentTitle("Signing in · GoList");

  useEffect(() => {
    dispatch({ type: "session/verifyEmail" });
  }, [dispatch]);

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(() => navigate("/_/myList"), 1200);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  if (status === "success") {
    return (
      <div className="w-full max-w-md py-12 text-center">
        <CheckIcon
          className="mx-auto h-10 w-10 text-green-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          You’re signed in
        </h1>
        <p className="mt-2 text-gray-600">Taking you to your lists…</p>
      </div>
    );
  }

  // Opening the link on a different device from the one that requested it
  // means the email is not in this browser's storage. The old code called
  // window.prompt() here.
  if (status === "needsEmail") {
    return (
      <div className="w-full max-w-md py-12">
        <h1 className="text-xl font-bold text-gray-900">
          Confirm your email address
        </h1>
        <p className="mt-2 text-gray-600">
          It looks like you opened this link on a different device. Enter the
          address you requested the link with to finish signing in.
        </p>
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "session/verifyEmail", email });
          }}
        >
          <TextInput
            inputId="confirm-email"
            labelText="Email"
            value={email}
            setValue={setEmail}
            isEmail
            isRequired
          />
          <button
            type="submit"
            disabled={!email}
            className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Finish signing in
          </button>
        </form>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full max-w-md py-12 text-center">
        <ExclamationTriangleIcon
          className="mx-auto h-10 w-10 text-amber-500"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          This sign-in link didn’t work
        </h1>
        <p className="mt-2 text-gray-600">
          Sign-in links expire and can only be used once. Request a new one to
          try again.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Back to GoList
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 py-16 text-gray-500"
      role="status"
    >
      <Spinner className="h-5 w-5" />
      <span>Signing you in…</span>
    </div>
  );
}
