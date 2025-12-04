import { Link } from "react-router-dom";

function AdminPage() {
    return (
        <main className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center bg-gray-100 p-2">
            <Link to="/">
                <h1 className="mb-12 text-5xl font-bold text-gray-800 text-shadow-md">
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </h1>
            </Link>
        </main>
    );
}

export default AdminPage;
