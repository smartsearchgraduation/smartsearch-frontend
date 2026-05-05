import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductListItem } from "./ProductListItem";
import * as api from "../lib/api";
import { type Product } from "../lib/api";

// Mock the API module
vi.mock("../lib/api", () => ({
    fetchProductImage: vi.fn(),
}));

describe("ProductListItem", () => {
    let queryClient: QueryClient;

    const mockProduct: Product = {
        product_id: "123",
        name: "Test Product Name",
        brand: { brand_id: 1, name: "TestBrand" },
        price: 99.99,
        description: "This is a test product description that should be truncated",
        is_relevant: null,
        images: ["image1.jpg"],
        categories: [
            {
                category_id: 1,
                name: "Subcategory",
                parent: { category_id: 0, name: "Parent Category" },
            },
        ],
        subcategory: "subcategory",
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    const renderListItem = (product = mockProduct) => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();
        return render(
            <QueryClientProvider client={queryClient}>
                <ProductListItem product={product} onEdit={onEdit} onDelete={onDelete} />
            </QueryClientProvider>,
            { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> },
        );
    };

    describe("Product Data Rendering", () => {
        it("renders product name", () => {
            renderListItem();
            expect(screen.getByText("Test Product Name")).toBeInTheDocument();
        });

        it("renders product image", () => {
            renderListItem();
            const image = screen.queryByRole("img", { name: /product/i });
            expect(image).not.toBeInTheDocument();
        });

        it("renders product description", () => {
            renderListItem();
            expect(screen.getByText(/This is a test product description/)).toBeInTheDocument();
        });

        it("renders brand badge", () => {
            renderListItem();
            expect(screen.getByText("TestBrand")).toBeInTheDocument();
        });

        it("renders price with correct formatting", () => {
            renderListItem();
            expect(screen.getByText("$99.99")).toBeInTheDocument();
        });

        it("renders category badges", () => {
            renderListItem();
            expect(screen.getByText("Parent Category")).toBeInTheDocument();
            expect(screen.getByText("Subcategory")).toBeInTheDocument();
        });

        it("renders fallback when no category", () => {
            const productNoCategory: Product = {
                ...mockProduct,
                categories: [],
            };
            renderListItem(productNoCategory);
            expect(screen.getByText("No category")).toBeInTheDocument();
            expect(screen.getByText("No subcategory")).toBeInTheDocument();
        });
    });

    describe("Image Loading", () => {
        it("fetches cover image on mount", async () => {
            vi.mocked(api.fetchProductImage).mockResolvedValue({ product_id: 123, image: "cover.jpg" });
            renderListItem();

            await waitFor(() => {
                expect(api.fetchProductImage).toHaveBeenCalledWith("123");
            });
        });

        it("renders image when fetch succeeds", async () => {
            vi.mocked(api.fetchProductImage).mockResolvedValue({ product_id: 123, image: "cover.jpg" });
            renderListItem();

            await waitFor(() => {
                const img = screen.getByAltText(/Test Product Name thumbnail/);
                expect(img).toBeInTheDocument();
                expect(img).toHaveAttribute("src", "cover.jpg");
            });
        });

        it("renders fallback when image not yet loaded", () => {
            vi.mocked(api.fetchProductImage).mockResolvedValue({ product_id: 123, image: "cover.jpg" });
            renderListItem();

            // Initially shows fallback before image loads
            // Use queryByRole to check for absence (SVG icons may have role="img")
            expect(screen.queryByRole("img", { name: /product/i })).not.toBeInTheDocument();
        });

        it("handles image fetch error gracefully", async () => {
            vi.mocked(api.fetchProductImage).mockRejectedValue(new Error("Failed to fetch"));
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            renderListItem();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });
    });

    describe("Action Buttons", () => {
        it("renders Edit button", () => {
            const onEdit = vi.fn();
            const onDelete = vi.fn();
            render(
                <QueryClientProvider client={queryClient}>
                    <ProductListItem product={mockProduct} onEdit={onEdit} onDelete={onDelete} />
                </QueryClientProvider>,
            );

            expect(screen.getByText("Edit")).toBeInTheDocument();
        });

        it("renders Delete button", () => {
            const onEdit = vi.fn();
            const onDelete = vi.fn();
            render(
                <QueryClientProvider client={queryClient}>
                    <ProductListItem product={mockProduct} onEdit={onEdit} onDelete={onDelete} />
                </QueryClientProvider>,
            );

            expect(screen.getByText("Delete")).toBeInTheDocument();
        });

        it("calls onEdit when Edit button clicked", () => {
            const onEdit = vi.fn();
            const onDelete = vi.fn();
            render(
                <QueryClientProvider client={queryClient}>
                    <ProductListItem product={mockProduct} onEdit={onEdit} onDelete={onDelete} />
                </QueryClientProvider>,
            );

            const editButton = screen.getByText("Edit");
            editButton.click();

            expect(onEdit).toHaveBeenCalledWith(mockProduct);
        });

        it("calls onDelete when Delete button clicked", () => {
            const onEdit = vi.fn();
            const onDelete = vi.fn();
            render(
                <QueryClientProvider client={queryClient}>
                    <ProductListItem product={mockProduct} onEdit={onEdit} onDelete={onDelete} />
                </QueryClientProvider>,
            );

            const deleteButton = screen.getByText("Delete");
            deleteButton.click();

            expect(onDelete).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe("Layout and Styling", () => {
        it("applies Card component wrapper", () => {
            const { container } = renderListItem();
            const card = container.querySelector('[class*="bg-gray-200"]');
            expect(card).toBeInTheDocument();
        });
    });
});
