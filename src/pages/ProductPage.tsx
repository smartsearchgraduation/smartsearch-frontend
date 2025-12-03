import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../components/SearchBar";
import { fetchProductById } from "../lib/api";
import LoadingWave from "../components/LoadingWave";
import { Card } from "../components/ui/Card";

function ProductPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => fetchProductById(productId!),
        enabled: !!productId,
    });

    const handleSearchSuccess = (newSearchId: string) => {
        navigate(`/search/${newSearchId}`);
    };

    const renderContent = () => {
        if (isLoading) return <LoadingWave message="Loading product details" />;

        if (isError) {
            return (
                <div role="alert" className="text-center text-red-500 py-12">
                    {error?.message || "Failed to fetch product."}
                </div>
            );
        }

        if (!product) {
            return (
                <div role="status" className="text-center text-gray-500 py-12">
                    Product not found.
                </div>
            );
        }

        const category = (product as any).category || "Uncategorized";
        const subcategory = (product as any).subcategory || "General";

        return (
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs: Minimal hierarchy display */}
                <nav className="flex items-center text-sm text-gray-500">
                    <Link to="/" className="hover:text-emerald-600 transition-colors">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="hover:text-emerald-600 transition-colors cursor-pointer">{category}</span>
                    <span className="mx-2">/</span>
                    <span className="font-bold text-gray-900 truncate max-w-[200px]">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Image */}
                    <Card className="aspect-square w-full bg-gray-200 overflow-hidden border-none shadow-md">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <svg
                                    className="w-16 h-16 mb-2 opacity-50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>No image available</span>
                            </div>
                        )}
                    </Card>

                    <div className="flex flex-col gap-4">
                        {/* Categories displayed as Tags/Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-200 rounded-full">
                                {category}
                            </span>
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full">
                                {subcategory}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{product.title}</h1>

                        <div className="text-3xl text-gray-700 font-medium">
                            {product.price ? `${product.price}` : "Price hidden"}
                        </div>

                        {/* Description */}
                        <div className="prose prose-lg text-gray-600 leading-relaxed mt-2">
                            <p>{product.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto bg-gray-100 py-6 px-2">
            <header className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Link
                    to="/"
                    className="mb-4 flex gap-2 sm:gap-0 sm:flex-col sm:mb-auto text-4xl font-bold text-gray-800 text-shadow-md outline-none cursor-pointer"
                >
                    <span className="text-emerald-600">Smart </span>
                    <span className="text-gray-800">Search</span>
                </Link>
                <SearchBar onSearchSuccess={handleSearchSuccess} className="w-full max-w-150" />
            </header>

            <main>{renderContent()}</main>
        </div>
    );
}

export default ProductPage;
