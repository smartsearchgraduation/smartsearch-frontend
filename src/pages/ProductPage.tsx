import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../components/SearchBar";
import { fetchProductById } from "../lib/api";
import LoadingWave from "../components/LoadingWave";
import { Card } from "../components/ui/Card";
import { ImageCarousel } from "../components/ImageCarousel";

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

    const handleSearchSuccess = (newSearchId: string, startTime?: number) => {
        navigate(`/search/${newSearchId}`, { state: { startTime } });
    };

    const renderContent = () => {
        if (isLoading) return <LoadingWave message="Loading product details" />;

        if (isError) {
            return (
                <div role="alert" className="py-12 text-center text-red-500">
                    {error?.message || "Failed to fetch product."}
                </div>
            );
        }

        if (!product) {
            return (
                <div role="status" className="py-12 text-center text-gray-500">
                    Product not found.
                </div>
            );
        }

        const category = product.categories[1]?.parent?.name || "Uncategorized";
        const subcategory = product.categories[1]?.name || "General";

        return (
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                {/* Left Column: Image */}
                <Card className="aspect-square w-full overflow-hidden border-none bg-gray-200 shadow-md">
                    <ImageCarousel images={product.images} alt={product.name} className="h-full w-full" />
                </Card>

                <div className="flex flex-col gap-4">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase">
                            {category}
                        </span>
                        <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold tracking-wider text-emerald-900 uppercase">
                            {subcategory}
                        </span>
                    </div>

                    <h1 className="text-3xl text-gray-900 sm:text-4xl">
                        <span className="font-bold">{product.brand.name}</span> <span>{product.name}</span>
                    </h1>

                    <div className="text-3xl font-medium text-gray-700">
                        {product.price ? `$${product.price}` : "Price hidden"}
                    </div>

                    {/* Description */}
                    <div className="prose prose-lg mt-2 leading-relaxed text-gray-600">
                        <p>{product.description}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mx-auto min-h-screen max-w-6xl bg-gray-100 px-2 py-6">
            <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <Link
                    to="/"
                    className="mb-4 flex cursor-pointer gap-2 text-4xl font-bold text-gray-800 outline-none text-shadow-md sm:mb-auto sm:flex-wrap"
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
