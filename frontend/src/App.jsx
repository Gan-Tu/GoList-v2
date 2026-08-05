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

import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ApplicationUI from "./components/Layout/ApplicationUI";
import CreateCollectionModal from "./components/Collections/CreateCollectionModal";
import CollectionView from "./components/Collections/CollectionView";
import NotFound from "./components/Layout/NotFound";
import { Spinner } from "./components/Utilities/SvgIcons";

// Routes a visitor may never open are split out of the main bundle. The
// privacy policy in particular is a wall of text nobody downloads on the way
// to viewing a list.
const PrivacyPolicy = lazy(() => import("./components/Layout/PrivacyPolicy"));
const VerifyEmail = lazy(() => import("./components/Session/VerifyEmail"));
const MyCollections = lazy(() =>
  import("./components/Collections/MyCollections")
);

function Home() {
  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          One short URL for every link that belongs together
        </h1>
        <p className="mt-3 text-gray-600">
          Bundle links into a collection and share it as{" "}
          <span className="font-medium text-gray-900">goli.st/your-name</span>.
        </p>
      </div>
      <CreateCollectionModal />
    </div>
  );
}

function RouteFallback() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-16 text-gray-500"
      role="status"
    >
      <Spinner className="w-5 h-5" />
      <span>Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ApplicationUI>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/_/verifyEmail" element={<VerifyEmail />} />
            <Route path="/_/myList" element={<MyCollections />} />
            <Route path="/:id" element={<CollectionView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ApplicationUI>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
