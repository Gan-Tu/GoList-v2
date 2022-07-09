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
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import CollectionView from "./components/CollectionView";

function App() {
  return (
    <div className="grid grid-cols-1 h-screen">
      <NavBar />
      <div className="grid justify-items-center -mt-8">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<CollectionView />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </div>
  );
}

export default App;
