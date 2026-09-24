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
import Footer from "./Footer";
import NavBar from "./NavBar";

const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID;

export default function ApplicationUI({ children }) {
  useEffect(() => {
    // Intercom used to be booted from the render body, so it re-ran on every
    // render. It is also ~300 KB of third-party JavaScript that every anonymous
    // visitor downloaded before seeing a list, so it is now imported lazily
    // after mount and skipped entirely when no workspace is configured.
    if (!INTERCOM_APP_ID) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      import("@intercom/messenger-js-sdk")
        .then(({ default: Intercom }) => {
          if (!cancelled) Intercom({ app_id: INTERCOM_APP_ID });
        })
        .catch(() => {
          /* support chat is optional */
        });
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    // A flex column with a growing main is what keeps the footer at the bottom
    // on short pages without the fixed positioning that used to overlap
    // content on mobile. dvh rather than vh: on phones 100vh is the height
    // with the browser toolbar hidden, which pushed the footer below the fold.
    <div className="flex min-h-dvh flex-col bg-canvas">
      <NavBar />
      {/* The same centered column as the header and footer, so every edge
          lines up. Pages fill its width and center anything narrower
          themselves. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
