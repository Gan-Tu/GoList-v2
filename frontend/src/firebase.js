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

import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// A Firebase web config is public by design — it identifies the project, it
// does not authorize anything. Security comes from Firestore rules and App
// Check, not from hiding these values. They live in env vars anyway so a fork
// or a staging project can point elsewhere without editing source.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true";

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const functions = getFunctions(app);
const auth = getAuth(app);

if (useEmulators) {
  // Pointed at the local suite so development and tests never read, write, or
  // bill against production data.
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// App Check and Analytics are both imported dynamically so Rollup keeps them
// out of the critical chunk. Neither is needed to render a collection, and
// together they were a large slice of the initial Firebase download.
//
// App Check attests that calls come from the real site. The emulator suite has
// no attestation provider, so initializing it there would just fail every call.
if (!useEmulators && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  import("firebase/app-check")
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      if (import.meta.env.DEV) {
        // Lets a developer register a debug token in the Firebase console
        // instead of solving a reCAPTCHA on localhost.
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY
        ),
        isTokenAutoRefreshEnabled: true
      });
    })
    .catch((error) => console.error("App Check failed to start:", error));
}

// Analytics reports nothing useful from a developer's machine, so it is
// production-only.
if (!useEmulators && import.meta.env.PROD) {
  import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(app);
    })
    .catch(() => {
      /* analytics is optional; never block the app on it */
    });
}

export { app, db, functions, auth, useEmulators };
