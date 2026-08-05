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

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import reducers from "./redux/index";
import rootSagas from "./sagas";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: reducers,
  // configureStore wires up the Redux DevTools properly. The previous setup
  // used `window.devToolsExtension`, removed from the extension years ago, so
  // devtools had silently stopped working.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // These development-only checks are what catch accidental state mutation
      // and non-serializable values before they turn into debugging mysteries.
      immutableCheck: true,
      serializableCheck: {
        // The Firebase user object is a class instance and is deliberately
        // parked in state; nothing else non-serializable belongs there.
        ignoredPaths: ["session.user"],
        ignoredActions: ["session/userChanged"]
      }
    }).concat(sagaMiddleware)
});

sagaMiddleware.run(rootSagas);

export default store;
