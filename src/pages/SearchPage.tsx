import { useParams, useNavigate } from "react-router-dom";
import { fetchSearchResults, type Product } from "../api";
import ProductCard from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../components/SearchBar";

function SearchPage() {
    const { searchId } = useParams<{ searchId: string }>();
    const navigate = useNavigate();

    const {
        data: results,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["searchResults", searchId],
        queryFn: () => fetchSearchResults(searchId!),
        enabled: !!searchId,
    });

    const handleSearchSuccess = (newSearchId: string) => {
        navigate(`/search/${newSearchId}`);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-gray-500">Loading results...</div>;
        }

        if (isError) {
            return (
                <div className="text-center text-red-500">{error?.message || "Failed to fetch search results."}</div>
            );
        }

        if (!results || results.length === 0) {
            return <div className="text-center text-gray-500">No products found.</div>;
        }

        return (
            <div className="grid sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] grid-cols-2 gap-2 sm:gap-4">
                {results.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto bg-gray-100 py-6 px-2">
            <header className="mb-8 flex flex-col sm:flex-row items-center justify-between">
                <button
                    onClick={() => {
                        navigate("/");
                    }}
                    className="mb-4 sm:mb-auto text-4xl font-bold text-gray-800 text-shadow-md outline-none cursor-pointer"
                >
                    <span className="text-blue-500">Smart </span>
                    <span className="text-gray-800">Search</span>
                </button>
                <SearchBar onSearchSuccess={handleSearchSuccess} className="w-full max-w-150" />
            </header>
            <div>{renderContent()}</div>
        </div>
    );
}

export default SearchPage;
