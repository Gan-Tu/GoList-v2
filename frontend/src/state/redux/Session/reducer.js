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
  emailForSignIn: null,
  emailVerificationSuccess: false,
  emailVerificationFailed: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_SESSION_USER":
      if (action.user?.uid) {
        console.log(
          "Logged in with uid:",
          action.user?.uid,
          "and email:",
          action.user?.email
        );
      }
      return { ...state, user: action.user };
    case "SET_EMAIL_FOR_SIGN_IN":
      return { ...state, emailForSignIn: action.emailForSignIn };
    case "SET_EMAIL_VERIFICATION_SUCCESS":
      return { ...state, emailVerificationSuccess: true };
    case "SET_EMAIL_VERIFICATION_FAILED":
      return { ...state, emailVerificationFailed: true };
    default:
      return { ...state };
  }
}
