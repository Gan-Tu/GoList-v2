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
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function* login({ loginType }) {
  const auth = getAuth();
  switch (loginType) {
    case "GOOGLE": {
      const provider = new GoogleAuthProvider();
      try {
        const { user } = yield call(signInWithPopup, auth, provider);
        yield put({ type: "SIGN_IN_USER", user });
        toast.success("Successfully signed in with Google");
      } catch (error) {
        toast.error("Failed to sign in with Google");
        console.error(error);
      }
      return;
    }
    case "FACEBOOK":
      break;
    case "TWITTER":
      break;
    case "GITHUB":
      break;
    case "EMAIL":
      break;
    case "GUEST":
      break;
    default:
      break;
  }
  toast.error("Log in is not implemented yet");
}

export function* watchSessionApp() {
  yield takeLatest("LOG_IN", login);
}
