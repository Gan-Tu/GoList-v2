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
import { useSelector } from "react-redux";

export function useLoggedInUser() {
  return useSelector((store) => store.session.user);
}

export function useLoggedInUserId() {
  return useSelector((store) => store.session.user?.uid);
}

/**
 * True only for a real account. Anonymous sessions exist so that every list
 * has an owner, but they should not make the UI claim the visitor is signed in.
 */
export function useHasAccount() {
  return useSelector(
    (store) => Boolean(store.session.user) && !store.session.user.isAnonymous
  );
}

/** False until Firebase has restored (or ruled out) a persisted session. */
export function useAuthResolved() {
  return useSelector((store) => store.session.authResolved);
}

export function useEmailForSignIn() {
  return useSelector((store) => store.session.emailForSignIn);
}

export function useEmailVerificationStatus() {
  return useSelector((store) => store.session.emailVerification);
}

/**
 * Sets the document title, replacing react-helmet.
 *
 * Collection pages get their real title server-side from renderCollection, so
 * all this needs to do is keep the tab in step during client-side navigation.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
