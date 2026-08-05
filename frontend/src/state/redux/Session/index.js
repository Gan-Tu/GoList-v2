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

import { call, fork, put, take, takeLatest } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import toast from "react-hot-toast";
import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  getRedirectResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "firebase/auth";
import { auth } from "../../../firebase";

const EMAIL_STORAGE_KEY = "emailForSignIn";

const PROVIDERS = {
  GOOGLE: GoogleAuthProvider,
  FACEBOOK: FacebookAuthProvider,
  TWITTER: TwitterAuthProvider,
  GITHUB: GithubAuthProvider
};

/**
 * Guarantees a uid before a write, signing in anonymously if needed.
 *
 * Every collection now has an owner, which is what makes the ownership checks
 * in firestore.rules enforceable. It also means a signed-out visitor can still
 * create a list and keep editing it — previously an anonymous list was
 * immediately orphaned and could never be changed by anyone.
 */
export async function ensureSignedIn() {
  // currentUser is null until the persisted session is restored, so checking it
  // directly would sign a returning user in as a second, anonymous account.
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser.uid;

  try {
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  } catch (error) {
    console.error("Anonymous sign-in failed:", error);
    return null;
  }
}

/**
 * Bridges Firebase's auth listener into Redux.
 *
 * This used to run in App's render body with no cleanup, registering a fresh
 * listener on every render and dispatching from each one.
 */
function createAuthChannel() {
  return eventChannel((emit) =>
    onAuthStateChanged(
      auth,
      (user) => emit({ user }),
      (error) => {
        console.error("Auth listener error:", error);
        emit({ user: null });
      }
    )
  );
}

function* watchAuthState() {
  const channel = yield call(createAuthChannel);
  try {
    while (true) {
      const { user } = yield take(channel);
      yield put({
        type: "session/userChanged",
        // Only the fields the UI actually reads. Parking the whole Firebase
        // user class in the store makes it non-serializable and drags private
        // token internals through devtools.
        user: user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              isAnonymous: user.isAnonymous
            }
          : null
      });
    }
  } finally {
    channel.close();
  }
}

/** Completes a redirect-based sign-in after the browser comes back. */
function* consumeRedirectResult() {
  try {
    const result = yield call(getRedirectResult, auth);
    if (result?.user) {
      toast.success("Signed in.", { duration: 1500 });
    }
  } catch (error) {
    console.error("Redirect sign-in failed:", error);
    toast.error("Sign in failed.");
  }
}

/**
 * Popups are unreliable on mobile browsers — iOS Safari in particular blocks
 * them outright — so small screens go straight to redirect, and any popup
 * failure elsewhere falls back to it.
 */
function prefersRedirect() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 640px)").matches ?? false;
}

async function signInWithProvider(providerKey) {
  const Provider = PROVIDERS[providerKey];
  const provider = new Provider();

  if (prefersRedirect()) {
    await signInWithRedirect(auth, provider);
    return { redirected: true };
  }

  try {
    await signInWithPopup(auth, provider);
    return { redirected: false };
  } catch (error) {
    const fallbackCodes = [
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment"
    ];
    if (fallbackCodes.includes(error?.code)) {
      if (error.code === "auth/popup-closed-by-user") throw error;
      await signInWithRedirect(auth, provider);
      return { redirected: true };
    }
    throw error;
  }
}

function* logIn({ loginType, email }) {
  if (loginType === "GUEST") {
    const uid = yield call(ensureSignedIn);
    if (uid) {
      toast.success("Signed in as a guest.", { duration: 1500 });
    } else {
      toast.error("Sign in failed.");
    }
    return;
  }

  if (loginType === "EMAIL") {
    if (!email) {
      toast.error("An email address is required.");
      return;
    }
    try {
      yield call(sendSignInLinkToEmail, auth, email, {
        // Follows whatever origin the app is actually served from, so sign-in
        // links work on localhost and preview channels, not just goli.st.
        url: `${window.location.origin}/_/verifyEmail`,
        handleCodeInApp: true
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      yield put({ type: "session/emailForSignIn", email });
      toast.success("Check your inbox for a sign-in link.");
    } catch (error) {
      console.error("Email sign-in failed:", error);
      toast.error("Could not send a sign-in link.");
    }
    return;
  }

  if (!PROVIDERS[loginType]) {
    toast.error("That sign-in method is not available.");
    return;
  }

  try {
    const { redirected } = yield call(signInWithProvider, loginType);
    if (!redirected) toast.success("Signed in.", { duration: 1500 });
  } catch (error) {
    if (error?.code === "auth/popup-closed-by-user") return;
    console.error("Sign-in failed:", error);
    toast.error("Sign in failed.");
  }
}

function* logOut() {
  try {
    yield call(signOut, auth);
    toast.success("Signed out.", { duration: 1500 });
  } catch (error) {
    console.error("Sign-out failed:", error);
    toast.error("Could not sign out.");
  }
}

function* verifyEmail({ email }) {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    yield put({ type: "session/emailVerification", status: "failed" });
    return;
  }

  const storedEmail = email || window.localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!storedEmail) {
    // Opened on a different device from the one that requested the link. The
    // view renders a form for this rather than a window.prompt().
    yield put({ type: "session/emailVerification", status: "needsEmail" });
    return;
  }

  try {
    yield call(signInWithEmailLink, auth, storedEmail, window.location.href);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    yield put({ type: "session/emailVerification", status: "success" });
  } catch (error) {
    console.error("Email verification failed:", error);
    yield put({ type: "session/emailVerification", status: "failed" });
  }
}

export function* watchSessionApp() {
  yield takeLatest("session/logIn", logIn);
  yield takeLatest("session/logOut", logOut);
  yield takeLatest("session/verifyEmail", verifyEmail);
  // Both of these run for the lifetime of the app, so they are forked rather
  // than called — a blocking call here would stop the watchers above from
  // ever being registered.
  yield fork(consumeRedirectResult);
  yield fork(watchAuthState);
}
