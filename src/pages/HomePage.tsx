import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function HomePage() {
    const navigate = useNavigate();

    const handleSearchSuccess = (searchId: string) => {
        navigate(`/search/${searchId}`);
    };

    return (
        <main className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center bg-gray-100 p-2">
            <Link to="/">
                <h1 className="mb-12 text-5xl font-bold text-gray-800 text-shadow-md">
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </h1>
            </Link>

            <SearchBar
                className="mb-12 w-full max-w-[37.5rem]"
                onSearchSuccess={handleSearchSuccess}
                autofocus={true}
            />
        </main>
    );
}

export default HomePage;
