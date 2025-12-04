import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProductPage from "./pages/ProductPage";
import AddProductPage from "./pages/AddProductPage";
import AdminPage from "./pages/AdminPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search/:searchId" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />

            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/add-product" element={<AddProductPage />} />
        </Routes>
    );
}

export default App;
