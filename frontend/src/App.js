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

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ApplicationUI from "./components/Layout/ApplicationUI";
import CollectionView from "./components/Collections/CollectionView";
import CreateCollectionModal from "./components/Collections/CreateCollectionModal";
import PrivacyPolicy from "./components/Layout/PrivacyPolicy";
import VerifyEmail from "./components/Session/VerifyEmail";
import MyCollections from "./components/Collections/MyCollections";

function Home() {
  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-5">
      <CreateCollectionModal />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    dispatch({ type: "SET_SESSION_USER", user });
  });

  return (
    <BrowserRouter>
      <ApplicationUI>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/privacy"
            element={<PrivacyPolicy isOpen={true} onClose={null} />}
          />
          <Route path="/_/verifyEmail" element={<VerifyEmail />} />
          <Route path="/_/myList" element={<MyCollections />} />
          <Route path="/:id" element={<CollectionView />} />
        </Routes>
        <Toaster position="top-right" />
      </ApplicationUI>
    </BrowserRouter>
  );
}

export default App;
