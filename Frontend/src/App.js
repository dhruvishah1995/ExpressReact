import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Search from './components/Search';
import FeedDB from "./components/FeedDB";
import Enrichment from './components/Enrichment';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="enrichment" element={<Enrichment />} />
        <Route path="feedDB" element={<FeedDB />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
