import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    fetchProducts,
    fetchProductById,
    fetchSearchResults,
    fetchDbFallback,
    fetchCatagories,
    fetchBrands,
    fetchDurationStatistics,
    fetchRetrievalModels,
    fetchRetrievalStats,
    fetchRetrievalIndexStats,
    fetchCorrectionModels,
    saveSelectedCorrectionEngine,
    fetchProductImage,
    fetchProductImages,
    updateProduct,
    deleteProduct,
    searchRequest,
    createProduct,
    productFeedback,
    saveAndRebuildSelectedRetrievalModels,
    recordSearchDuration,
} from "./api";

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

    describe("fetchSearchResults", () => {
        it("successfully fetches search results", async () => {
            const mockSearchResults = {
                products: [],
                corrected_text: "test",
                search_id: "123",
                raw_text: "test",
                fusion_type: "late_fusion" as const,
                textual_model_name: "model1",
                visual_model_name: "model2",
                search_mode: "std" as const,
                correction_enabled: true,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            } as Response);

            const result = await fetchSearchResults("123");
            expect(result).toEqual(mockSearchResults);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchSearchResults("123")).rejects.toThrow("Failed to get results.");
        });
    });

    describe("fetchDbFallback", () => {
        it("successfully fetches DB fallback results", async () => {
            const mockDbFallback = {
                original_search_id: 123,
                search_text: "test",
                products: [],
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockDbFallback,
            } as Response);

            const result = await fetchDbFallback("123");
            expect(result).toEqual(mockDbFallback);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchDbFallback("123")).rejects.toThrow("Failed to fetch DB fallback results");
        });
    });

    describe("fetchCatagories", () => {
        it("successfully fetches categories", async () => {
            const mockCategories = {
                categories: [{ category_id: 1, name: "Electronics", parent_category_id: null }],
                total: 1,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCategories,
            } as Response);

            const result = await fetchCatagories();
            expect(result).toEqual(mockCategories);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchCatagories()).rejects.toThrow("Failed to fetch categories");
        });
    });

    describe("fetchBrands", () => {
        it("successfully fetches brands", async () => {
            const mockBrands = [
                { brand_id: 1, name: "Brand1" },
                { brand_id: 2, name: "Brand2" },
            ];

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ brands: mockBrands }),
            } as Response);

            const result = await fetchBrands();
            expect(result).toEqual(mockBrands);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchBrands()).rejects.toThrow("Failed to fetch brands");
        });
    });

    describe("fetchDurationStatistics", () => {
        it("successfully fetches duration statistics", async () => {
            const mockStats = [
                {
                    search_id: 1,
                    backend_total_time: 100,
                    correction_time: 10,
                    db_time: 20,
                    faiss_time: 30,
                    product_load_duration: 40,
                    search_duration: 50,
                    result_count: 10,
                },
            ];

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats,
            } as Response);

            const result = await fetchDurationStatistics();
            expect(result).toEqual(mockStats);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchDurationStatistics()).rejects.toThrow("Failed to fetch duration statistics");
        });
    });

    describe("fetchRetrievalModels", () => {
        it("successfully fetches retrieval models", async () => {
            const mockResponse = {
                status: "success",
                data: {
                    textual_models: [{ name: "model1", dimension: 768 }],
                    visual_models: [{ name: "model2", dimension: 512 }],
                    defaults: { textual: "model1", visual: "model2" },
                },
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await fetchRetrievalModels();
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchRetrievalModels()).rejects.toThrow("Failed to fetch retrieval models");
        });
    });

    describe("fetchRetrievalStats", () => {
        it("successfully fetches retrieval stats", async () => {
            const mockResponse = {
                status: "success",
                data: {
                    index_stats: {},
                    available_models: {},
                    selected_models: {
                        textual_model: "model1",
                        visual_model: "model2",
                        last_updated: "2024-01-01",
                    },
                    service_status: "active",
                },
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await fetchRetrievalStats();
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchRetrievalStats()).rejects.toThrow("Failed to fetch retrieval stats");
        });
    });

    describe("fetchRetrievalIndexStats", () => {
        it("successfully fetches retrieval index stats", async () => {
            const mockResponse = {
                status: "success",
                indices: {
                    model1: { textual: 100, visual: 100, fused: 100 },
                },
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await fetchRetrievalIndexStats();
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchRetrievalIndexStats()).rejects.toThrow("Failed to fetch retrieval index stats");
        });
    });

    describe("fetchCorrectionModels", () => {
        it("successfully fetches correction models", async () => {
            const mockResponse = {
                status: "success",
                data: {
                    engines: [
                        { name: "engine1", description: "Description 1" },
                        { name: "engine2", description: "Description 2" },
                    ],
                    defaults: { engine: "engine1" },
                    selected_engine: "engine1",
                },
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await fetchCorrectionModels();
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchCorrectionModels()).rejects.toThrow("Failed to fetch correction models");
        });
    });

    describe("saveSelectedCorrectionEngine", () => {
        it("successfully saves correction engine", async () => {
            const mockResponse = {
                status: "success",
                message: "Engine saved",
                data: { engine: "engine1" },
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await saveSelectedCorrectionEngine({ engine: "engine1" });
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(saveSelectedCorrectionEngine({ engine: "engine1" })).rejects.toThrow(
                "Failed to save correction engine",
            );
        });
    });

    describe("fetchProductImage", () => {
        it("successfully fetches product image", async () => {
            const mockImage = {
                product_id: 1,
                image: "https://example.com/image.jpg",
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockImage,
            } as Response);

            const result = await fetchProductImage("1");
            expect(result).toEqual(mockImage);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchProductImage("1")).rejects.toThrow("Failed to fetch product image");
        });
    });

    describe("fetchProductImages", () => {
        it("successfully fetches product images", async () => {
            const mockImages = {
                product_id: 1,
                images: [
                    { product_id: 1, image: "https://example.com/image1.jpg" },
                    { product_id: 1, image: "https://example.com/image2.jpg" },
                ],
                total: 2,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockImages,
            } as Response);

            const result = await fetchProductImages("1");
            expect(result).toEqual(mockImages);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(fetchProductImages("1")).rejects.toThrow("Failed to fetch product images");
        });
    });

    describe("updateProduct", () => {
        it("successfully updates product", async () => {
            const mockResponse = { success: true };
            const mockProductData = {
                name: "Updated Product",
                price: 199.99,
                description: "Updated description",
                brand: "Brand1",
                category_ids: [1, 2],
                images: [] as File[],
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await updateProduct("1", mockProductData);
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            const mockProductData = {
                name: "Updated Product",
                price: 199.99,
                description: "Updated description",
                brand: "Brand1",
                category_ids: [1, 2],
                images: [] as File[],
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(updateProduct("1", mockProductData)).rejects.toThrow("Failed to update product");
        });
    });

    describe("deleteProduct", () => {
        it("successfully deletes product", async () => {
            const mockResponse = { success: true };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await deleteProduct("1");
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(deleteProduct("1")).rejects.toThrow("Failed to delete product");
        });
    });

    describe("searchRequest", () => {
        it("successfully submits search request without image", async () => {
            const mockResponse = { search_id: "123" };
            const mockInput = {
                query: "test query",
                image: null,
                correctionEnabled: true,
                searchMode: "std" as const,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await searchRequest(mockInput);
            expect(result).toBe("123");
        });

        it("successfully submits search request with image", async () => {
            const mockResponse = { search_id: "123" };
            const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockInput = {
                query: "test query",
                image: mockFile,
                correctionEnabled: true,
                searchMode: "iwt" as const,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await searchRequest(mockInput);
            expect(result).toBe("123");
        });

        it("throws error on failure", async () => {
            const mockInput = {
                query: "test query",
                image: null,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(searchRequest(mockInput)).rejects.toThrow("Failed to submit search request");
        });
    });

    describe("createProduct", () => {
        it("successfully creates product", async () => {
            const mockResponse = { success: true, id: "123" };
            const mockProductData = {
                name: "New Product",
                price: 99.99,
                description: "Test description",
                brand: "Brand1",
                category_ids: [1, 2],
                images: [] as File[],
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await createProduct(mockProductData);
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            const mockProductData = {
                name: "New Product",
                price: 99.99,
                description: "Test description",
                brand: "Brand1",
                category_ids: [1, 2],
                images: [] as File[],
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(createProduct(mockProductData)).rejects.toThrow("Failed to create product");
        });
    });

    describe("productFeedback", () => {
        it("successfully submits like feedback", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await expect(productFeedback("123", "456", "like")).resolves.not.toThrow();
        });

        it("successfully submits dislike feedback", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await expect(productFeedback("123", "456", "dislike")).resolves.not.toThrow();
        });

        it("throws error on failure", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(productFeedback("123", "456", "like")).rejects.toThrow("Failed to submit vote");
        });
    });

    describe("saveAndRebuildSelectedRetrievalModels", () => {
        it("successfully saves and rebuilds retrieval models", async () => {
            const mockResponse = {
                status: "success",
                data: {
                    textual_model: "model1",
                    visual_model: "model2",
                    total_products: 100,
                    successful_count: 95,
                    failed_count: 5,
                    total_duration_ms: 5000,
                },
                errors: [],
            };
            const mockPayload = {
                textual_model: "model1",
                visual_model: "model2",
                fusion_endpoint: "endpoint1",
                wait_duration_seconds: 60,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await saveAndRebuildSelectedRetrievalModels(mockPayload);
            expect(result).toEqual(mockResponse);
        });

        it("throws error on failure", async () => {
            const mockPayload = {
                textual_model: "model1",
                visual_model: "model2",
                fusion_endpoint: "endpoint1",
                wait_duration_seconds: 60,
            };

            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: false,
            } as Response);

            await expect(saveAndRebuildSelectedRetrievalModels(mockPayload)).rejects.toThrow(
                "Failed to save retrieval models and rebuild index",
            );
        });
    });

    describe("recordSearchDuration", () => {
        it("successfully records search duration", async () => {
            vi.mocked(globalThis.fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await expect(recordSearchDuration("123", 100, 50)).resolves.not.toThrow();
        });

        it("handles errors gracefully without throwing", async () => {
            vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("Network error"));

            await expect(recordSearchDuration("123", 100, 50)).resolves.not.toThrow();
        });
    });
});
