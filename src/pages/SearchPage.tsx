import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchResults, getRawTextResults, recordSearchDuration, type Product } from "../lib/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import LoadingWave from "../components/LoadingWave";

function SearchPage() {
    const { searchId } = useParams() as { searchId: string };
    const navigate = useNavigate();
    const location = useLocation();
    const searchDuration = location.state?.searchDuration as number | undefined;
    const recordedRef = useRef<string | null>(null);
    const loadStartTimeRef = useRef<number>(performance.now());
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        loadStartTimeRef.current = performance.now();
        setIsRedirecting(false);
    }, [searchId]);

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

    useEffect(() => {
        if (results && !isLoading && !isError && searchDuration !== undefined && recordedRef.current !== searchId) {
            // Use sessionStorage to prevent duplicate logging across reloads
            const sessionKey = `recorded_search_${searchId}`;
            if (!sessionStorage.getItem(sessionKey)) {
                const loadEndTime = performance.now();
                const productLoadDuration = loadEndTime - loadStartTimeRef.current;
                recordSearchDuration(searchId, searchDuration, productLoadDuration);
                sessionStorage.setItem(sessionKey, "true");
            }
            recordedRef.current = searchId;
        }
    }, [results, isLoading, isError, searchDuration, searchId]);

    const handleSearchSuccess = (newSearchId: string, newSearchDuration?: number) => {
        navigate(`/search/${newSearchId}`, { state: { searchDuration: newSearchDuration } });
    };

    const handleRawTextSearch = async () => {
        setIsRedirecting(true);
        const startTime = performance.now();
        try {
            const newSearchId = await getRawTextResults(searchId || "");
            const duration = performance.now() - startTime;
            handleSearchSuccess(newSearchId, duration);
        } catch (error) {
            console.error("Failed to fetch raw text results", error);
            setIsRedirecting(false);
        }
    };

    const renderContent = () => {
        if (isLoading || isRedirecting) {
            return <LoadingWave message={isRedirecting ? "Redirecting to raw search" : "Loading results"} />;
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
                    <ProductCard searchId={searchId} key={product.product_id} product={product} />
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

            {!isRedirecting && results && results.corrected_text != results.raw_text && (
                <main className="mb-6">
                    <h1 className="visually-hidden">Search Results</h1>
                    <h2 className="mb-1 text-gray-700">
                        Showing results for:{" "}
                        <span className="font-bold text-emerald-600">{results.corrected_text}</span>
                    </h2>
                    <p className="text-sm text-gray-600">
                        Search instead for:{" "}
                        <button
                            // Need to carry the image with me will look into when adding the image search
                            onClick={handleRawTextSearch}
                            className="cursor-pointer font-medium text-emerald-600 hover:underline"
                            disabled={isRedirecting}
                        >
                            {results.raw_text}
                        </button>
                    </p>
                </main>
            )}

            {renderContent()}
        </div>
    );
}

export default SearchPage;
