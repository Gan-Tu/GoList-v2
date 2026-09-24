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
import CollectionView from "./components/Collections/CollectionView";
import Home from "./components/Home/Home";
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

// A lazy chunk usually lands in well under 300ms, and a spinner shown for less
// than that just reads as a flicker. This one stays invisible for 300ms and
// only then fades in — a CSS animation delay, so there is no timer to clear.
function RouteFallback() {
  return (
    <div
      className="flex animate-[fade-in_200ms_ease-out_300ms_both] items-center justify-center gap-2 py-24 text-sm text-fg-muted"
      role="status"
    >
      <Spinner className="h-4 w-4" />
      <span>Loading…</span>
    </div>
  );
}

// Toasts are always a dark capsule, in both themes, so they read as system
// status rather than page content — and the icon colors are fixed to suit it.
const TOAST_OPTIONS = {
  style: {
    background: "rgb(var(--toast-bg))",
    color: "rgb(var(--toast-fg))",
    borderRadius: "14px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 500,
    boxShadow: "var(--shadow-popover)",
    maxWidth: "min(28rem, calc(100vw - 2rem))"
  },
  success: { iconTheme: { primary: "#30d158", secondary: "#0b0b0d" } },
  error: { iconTheme: { primary: "#ff453a", secondary: "#ffffff" } },
  loading: {
    iconTheme: {
      primary: "rgb(var(--toast-fg))",
      secondary: "rgb(var(--toast-fg) / 0.25)"
    }
  }
};

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
      {/* Top-center, just under the sticky header, where a phone's thumb and
          the support launcher in the bottom corner are not. */}
      <Toaster
        position="top-center"
        containerStyle={{ top: 68 }}
        gutter={8}
        toastOptions={TOAST_OPTIONS}
      />
    </BrowserRouter>
  );
}
