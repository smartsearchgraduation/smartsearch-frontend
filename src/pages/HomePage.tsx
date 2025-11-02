import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function HomePage() {
    const navigate = useNavigate();

    const handleSearchSuccess = (searchId: string) => {
        navigate(`/search/${searchId}`);
    };

    return (
        <div className="w-screen h-screen p-2 flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-5xl font-bold mb-12 text-gray-800 text-shadow-md">
                <span className="text-emerald-600">Smart </span>
                <span className="text-gray-800">Search</span>
            </h1>

            <SearchBar className="w-full max-w-150 mb-12" onSearchSuccess={handleSearchSuccess} />
        </div>
    );
}

export default HomePage;
