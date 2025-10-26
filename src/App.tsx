import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProductPage from "./pages/ProductPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search/:searchId" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
        </Routes>
    );
}

export default App;
