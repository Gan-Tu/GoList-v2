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
import { call, put, takeLatest } from "redux-saga/effects";
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  sendSignInLinkToEmail,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

function* logIn({ loginType, email }) {
  const auth = getAuth();
  let provider;
  switch (loginType) {
    case "GOOGLE":
      provider = new GoogleAuthProvider();
      break;
    case "FACEBOOK":
      provider = new FacebookAuthProvider();
      break;
    case "TWITTER":
      provider = new TwitterAuthProvider();
      break;
    case "GITHUB":
      provider = new GithubAuthProvider();
      break;
    case "GUEST":
      yield call(signInAnonymously, auth);
      toast.success("Successfully logged in.");
      return;
    case "EMAIL": {
      if (!email) {
        toast.error("Email is required for email sign in.");
        return;
      }
      try {
        // yield call(sendSignInLinkToEmail, auth, email, {
        //   url: "https://goli.st/verifyEmail",
        //   handleCodeInApp: true,
        // });
        window.localStorage.setItem("emailForSignIn", email);
        toast.success("A sign-in link is sent to your email!");
        yield put({ type: "SET_EMAIL_FOR_SIGN_IN", emailForSignIn: email });
      } catch (error) {
        toast.error("Log In Failed.");
        console.error(error);
      }
      return;
    }
    default:
      toast.error("Log in is not implemented yet");
      return;
  }
  try {
    yield call(signInWithPopup, auth, provider);
    toast.success("Successfully logged in.");
  } catch (error) {
    toast.error("Log In Failed.");
    console.error(error);
  }
}

function* logOut() {
  try {
    yield call(signOut, getAuth());
  } catch (error) {
    console.error(error);
    toast.error("Failed to sign out");
  }
}

export function* watchSessionApp() {
  yield takeLatest("LOG_IN", logIn);
  yield takeLatest("LOG_OUT", logOut);
}
