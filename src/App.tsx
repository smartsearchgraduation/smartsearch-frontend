import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProductPage from "./pages/ProductPage";
import AdminPage from "./pages/AdminPage";
import ProductListPage from "./pages/admin/ProductListPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search/:searchId" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminPage />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
            </Route>
        </Routes>
    );
}

export default App;
