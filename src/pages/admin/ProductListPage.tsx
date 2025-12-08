import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { ProductListItem } from "../../components/ProductListItem";
import { ProductFormModal } from "../../components/ProductFormModal";
import { fetchProducts, deleteProduct, type Product } from "../../lib/api";

const ITEMS_PER_PAGE = 10;

function ProductListPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const queryClient = useQueryClient();

    const {
        data: products = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            alert("Product has been deleted successfully.");
        },
        onError: (error) => {
            alert(`Failed to delete product: ${error.message}`);
        },
    });

    // --- Filtering Logic ---
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;

        const lowerQuery = searchQuery.toLowerCase();
        return products.filter((product) => {
            const nameMatch = product.name.toLowerCase().includes(lowerQuery);
            const brandMatch = product.brand.name.toLowerCase().includes(lowerQuery);
            const categoryMatch = product.categories.some(
                (c) => c.name.toLowerCase().includes(lowerQuery) || c.parent?.name.toLowerCase().includes(lowerQuery),
            );
            const subcategoryMatch = product.subcategory.toLowerCase().includes(lowerQuery);

            return nameMatch || brandMatch || categoryMatch || subcategoryMatch;
        });
    }, [products, searchQuery]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Reset to page 1 when search query changes
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to page 1 on search
    };

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    function handleDelete(product: Product): void {
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            deleteProductMutation.mutate(product.product_id);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="hidden">Products</h1>
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search by name, brand, or category..."
                    wrapperClassName="max-w-[600px]"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    label="Find a product"
                    leftIcon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                    }
                />
                <Button onClick={handleOpenAdd}>Add Product</Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md"></div>

            {/* Products Grid */}
            <div className="grid grid-cols-[auto_1fr_150px_100px_auto] gap-4">
                {/* Header Row */}
                <div className="contents text-xs font-semibold text-gray-500 uppercase">
                    <div className="px-4">Image</div>
                    <div className="px-4">Product Details</div>
                    <div className="px-4">Category</div>
                    <div className="px-4">Price</div>
                    <div className="px-4 text-right">Actions</div>
                </div>

                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading products...</div>
                ) : isError ? (
                    <div className="col-span-full py-12 text-center text-red-500">Failed to load products.</div>
                ) : paginatedProducts.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">No products found.</div>
                ) : (
                    paginatedProducts.map((product) => (
                        <ProductListItem
                            key={product.product_id}
                            product={product}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Pagination Footer */}
            {!isLoading && !isError && filteredProducts.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}

            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} />
        </div>
    );
}

export default ProductListPage;
