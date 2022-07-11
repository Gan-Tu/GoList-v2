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

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CircleCheck, CircleX, LoaderIcon } from "../Utilities/SvgIcons";
import {
  useEmailVerificationFailed,
  useEmailVerificationSuccess,
} from "../../hooks/session";
import { getAuth, isSignInWithEmailLink } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const failed = useEmailVerificationFailed();
  const verified = useEmailVerificationSuccess();

  useEffect(() => {
    const auth = getAuth();
    if (isSignInWithEmailLink(auth, window.location.href)) {
      dispatch({ type: "VERIFY_EMAIL" });
    } else {
      navigate("/");
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (verified) {
      toast.success("Successfully signed in!");
    }
  }, [verified]);

  useEffect(() => {
    if (!verified && failed) {
      toast.error("Sign In Verification Failed.");
    }
  }, [verified, failed]);

  if (verified) {
    return (
      <button
        disabled
        type="button"
        className="py-2.5 gap-2 px-5 mr-2 text-sm font-medium text-green-500 bg-white inline-flex items-center"
      >
        <CircleCheck className="w-6 h-6" />
        Signed in successfully.
      </button>
    );
  } else if (failed) {
    return (
      <button
        disabled
        type="button"
        className="py-2.5 gap-2 px-5 mr-2 text-sm font-medium text-red-500 bg-white inline-flex items-center"
      >
        <CircleX className="w-6 h-6" />
        Verification Failed.
      </button>
    );
  } else {
    return (
      <button
        disabled
        type="button"
        className="py-2.5 px-5 mr-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-400 inline-flex items-center"
      >
        <LoaderIcon className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600" />
        Signing in...
      </button>
    );
  }
}
