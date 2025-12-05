import { Link, NavLink, Outlet } from "react-router-dom";

function AdminPage() {
    return (
        <div className="mx-auto min-h-screen max-w-6xl bg-gray-100 py-6">
            {/* --- Header Section --- */}
            <header className="mb-8 flex items-center gap-2">
                <Link
                    to="/"
                    className="flex cursor-pointer gap-2 text-4xl font-bold text-gray-800 outline-none text-shadow-md"
                >
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </Link>
                <span className="text-4xl font-bold text-gray-600"> | </span>
                <div className="mt-auto flex items-center gap-6">
                    <span className="text-2xl font-bold text-gray-600">Admin</span>
                    <nav className="flex gap-4">
                        <NavLink
                            to="/admin/products"
                            className={({ isActive }) =>
                                `text-lg font-medium ${isActive ? "text-emerald-600 underline" : "text-gray-500 hover:text-gray-800"}`
                            }
                        >
                            Products
                        </NavLink>
                        <NavLink
                            to="/admin/statistics"
                            className={({ isActive }) =>
                                `text-lg font-medium ${isActive ? "text-emerald-600 underline" : "text-gray-500 hover:text-gray-800"}`
                            }
                        >
                            Statistics
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default AdminPage;
