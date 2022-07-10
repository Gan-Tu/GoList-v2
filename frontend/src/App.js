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
import NavBar from "./components/Layout/NavBar";
import Footer from "./components/Layout/Footer";
import CollectionView from "./components/CollectionView";
import CreateCollectionFlow from "./components/CreateCollectionFlow";

function Home() {
  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-5">
      <CreateCollectionFlow />
    </div>
  );
}

function App() {
  return (
    <div className="grid grid-cols-1 justify-items-between min-h-screen">
      <div className="grid items-start">
        <NavBar />
      </div>
      <div className="grid items-center">
        <div className="mx-auto">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:id" element={<CollectionView />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </div>
      </div>
      <div className="grid items-end">
        <Footer />
      </div>
    </div>
  );
}

export default App;
