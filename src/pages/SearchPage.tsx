import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults, getRawTextResults, type Product } from "../lib/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import LoadingWave from "../components/LoadingWave";

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
            return <LoadingWave message="Loading results" />;
        }

        if (isError) {
            return (
                <div role="alert" className="text-center text-red-500 py-10">
                    {error?.message || "Failed to fetch search results."}
                </div>
            );
        }

        if (!results || results.products.length === 0) {
            return (
                <div role="status" className="text-center text-gray-500 py-10">
                    No products found.
                </div>
            );
        }

        return (
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] grid-cols-2 gap-2 sm:gap-4">
                {results.products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto mb-12 bg-gray-100 py-6 px-2">
            <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Link
                    to="/"
                    className="mb-4 flex gap-2 sm:gap-0 sm:flex-wrap sm:mb-auto text-4xl font-bold text-gray-800 text-shadow-md outline-none cursor-pointer"
                >
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </Link>
                <SearchBar onSearchSuccess={handleSearchSuccess} className="w-full max-w-150" />
            </header>

            {results && results.correctedText && (
                <main className="mb-6">
                    {/* Visually hidden <h1> for page title and structure */}
                    <h1 className="visually-hidden">Search Results</h1>
                    <h2 className="text-gray-700 mb-1">
                        Showing results for: <span className="font-bold text-emerald-600">{results.correctedText}</span>
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Search instead for:{" "}
                        <button
                            disabled // Disabled for now will enable later
                            onClick={async () => handleSearchSuccess(await getRawTextResults(searchId || ""))}
                            className="text-emerald-600 hover:underline cursor-pointer font-medium"
                        >
                            {results.rawText}
                        </button>
                    </p>
                </main>
            )}

            {renderContent()}
        </div>
    );
}

export default SearchPage;
