import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../components/SearchBar";
import { fetchProductById } from "../api";

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
        if (isLoading) {
            return <div className="text-center text-gray-500">Loading product details...</div>;
        }

        if (isError) {
            return <div className="text-center text-red-500">{error?.message || "Failed to fetch product."}</div>;
        }

        if (!product) {
            return <div className="text-center text-gray-500">Product not found.</div>;
        }

        return (
            <div className="flex flex-col sm:flex-row shadow-lg rounded-lg overflow-hidden bg-gray-50 sm:gap-4 mx-auto">
                {/* Image Section */}
                <div className="aspect-square sm:w-1/2 bg-gray-200">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className="w-full object-cover" />
                    ) : (
                        <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                            <p className="text-gray-700">No image available</p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex gap-4 sm:w-1/2 p-4 flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                    <p className="text-gray-600 text-lg">{product.description}</p>
                    <p className="text-2xl text-gray-700">{product.price ? `${product.price}` : "Not available"}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen max-w-6xl mx-auto bg-gray-100 py-6 px-2">
            <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button
                    onClick={() => {
                        navigate("/");
                    }}
                    className="mb-4 flex gap-2 sm:gap-0 sm:flex-col sm:mb-auto text-4xl font-bold text-gray-800 text-shadow-md outline-none cursor-pointer"
                >
                    <span className="text-indigo-500">Smart </span>
                    <span className="text-gray-800">Search</span>
                </button>
                <SearchBar onSearchSuccess={handleSearchSuccess} className="w-full max-w-150" />
            </header>
            <div>{renderContent()}</div>
        </div>
    );
}

export default ProductPage;
