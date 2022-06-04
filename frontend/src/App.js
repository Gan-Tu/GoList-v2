import { BrowserRouter, Routes, Route } from "react-router-dom";
import CollectionCover from "./components/CollectionCover";
import Home from "./components/Home";
import CollectionView from "./components/CollectionView";

function App() {
  return (
    <div className="grid place-items-center h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:id" element={<CollectionView />} />
          <Route path="/:id/cover" element={<CollectionCover />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
