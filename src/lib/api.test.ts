import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchProducts, fetchProductById } from "./api";

describe("API functions", () => {
    beforeEach(() => {
        globalThis.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("fetchProducts", () => {
        it("successfully fetches products", async () => {
            const mockProducts = [
                {
                    product_id: "1",
                    name: "Test Product",
                    brand: { brand_id: 1, name: "Test Brand" },
                    price: 99.99,
                    description: "Test description",
                    is_relevant: null,
                    images: ["https://example.com/image.jpg"],
                    categories: [],
                    subcategory: "Test",
                },
            ];

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    products: mockProducts,
                    total: 1,
                }),
            } as Response);

            const result = await fetchProducts();
            expect(result.products).toEqual(mockProducts);
            expect(result.total).toBe(1);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchProducts()).rejects.toThrow("Failed to fetch products");
        });
    });

    describe("fetchProductById", () => {
        it("successfully fetches a product by ID", async () => {
            const mockProduct = {
                product_id: "1",
                name: "Test Product",
                brand: { brand_id: 1, name: "Test Brand" },
                price: 99.99,
                description: "Test description",
                is_relevant: null,
                images: ["https://example.com/image.jpg"],
                categories: [],
                subcategory: "Test",
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockProduct,
            } as Response);

            const result = await fetchProductById("1");
            expect(result).toEqual(mockProduct);
        });

        it("throws error when product not found", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchProductById("999")).rejects.toThrow("Product not found");
        });
    });
});
