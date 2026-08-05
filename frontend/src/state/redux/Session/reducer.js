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

const initialState = {
  user: null,
  // False until Firebase has told us whether a session exists. Without this the
  // UI cannot distinguish "signed out" from "still checking", and flashes the
  // signed-out state on every load.
  authResolved: false,
  domains: [],
  domainsStatus: "idle",
  emailForSignIn: null,
  emailVerification: "idle"
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "session/userChanged":
      // The previous implementation console.logged the uid and email of every
      // user on every auth state change.
      return { ...state, user: action.user || null, authResolved: true };

    case "session/domainsLoading":
      return { ...state, domainsStatus: "loading" };

    case "session/domainsLoaded":
      return { ...state, domains: action.domains, domainsStatus: "ready" };

    case "session/domainsError":
      return { ...state, domainsStatus: "error" };

    case "session/emailForSignIn":
      return { ...state, emailForSignIn: action.email };

    case "session/emailVerification":
      return { ...state, emailVerification: action.status };

    default:
      return state;
  }
}
