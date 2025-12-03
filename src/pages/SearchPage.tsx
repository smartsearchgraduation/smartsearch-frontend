import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults, getRawTextResults, type Product } from "../lib/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import LoadingWave from "../components/LoadingWave";

function SearchPage() {
    const { searchId } = useParams() as { searchId: string };
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
                <div role="alert" className="py-10 text-center text-red-500">
                    {error?.message || "Failed to fetch search results."}
                </div>
            );
        }

        if (!results || results.products.length === 0) {
            return (
                <div role="status" className="py-10 text-center text-gray-500">
                    No products found.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-4">
                {results.products.map((product: Product) => (
                    <ProductCard searchId={searchId} key={product.id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="mx-auto mb-12 min-h-screen max-w-6xl bg-gray-100 px-2 py-6">
            <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <Link
                    to="/"
                    className="mb-4 flex cursor-pointer gap-2 text-4xl font-bold text-gray-800 outline-none text-shadow-md sm:mb-auto sm:flex-wrap"
                >
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </Link>
                <SearchBar onSearchSuccess={handleSearchSuccess} className="w-full max-w-[37.5rem]" />
            </header>

            {results && results.correctedText && (
                <main className="mb-6">
                    {/* Visually hidden <h1> for page title and structure */}
                    <h1 className="visually-hidden">Search Results</h1>
                    <h2 className="mb-1 text-gray-700">
                        Showing results for: <span className="font-bold text-emerald-600">{results.correctedText}</span>
                    </h2>
                    <p className="text-sm text-gray-600">
                        Search instead for:{" "}
                        <button
                            disabled // Disabled for now will enable later
                            onClick={async () => handleSearchSuccess(await getRawTextResults(searchId || ""))}
                            className="cursor-pointer font-medium text-emerald-600 hover:underline"
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
