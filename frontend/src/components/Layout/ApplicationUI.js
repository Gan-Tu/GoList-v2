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

import Intercom from "@intercom/messenger-js-sdk";
import Footer from "./Footer";
import NavBar from "./NavBar";

export default function ApplicationUI({ children }) {
  Intercom({
    app_id: "od46lrxi"
  });

  return (
    <div className="flex justify-center h-screen overflow-scroll">
      <div className="fixed top-0 w-screen">
        <NavBar />
      </div>
      <div className="grid items-center px-3">
        <div className="mx-auto">{children}</div>
      </div>
      <div className="fixed bottom-0 bg-white w-screen">
        <Footer />
      </div>
    </div>
  );
}
