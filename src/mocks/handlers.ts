import { http, HttpResponse } from "msw";

let mockProducts = [
    {
        product_id: "1",
        name: "Vintage Leather Jacket",
        brand: { brand_id: 101, name: "UrbanStyle" },
        price: 89.99,
        description: "A stylish vintage leather jacket.",
        is_relevant: null,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 18,
                name: "Jackets",
                parent: { category_id: 2, name: "Clothing" },
            },
        ],
        subcategory: "Jackets",
        rank: 1,
        score: 0.92,
        text_score: 0.9,
        image_score: 0.94,
        combined_score: 0.92,
    },
    {
        product_id: "2",
        name: "Classic Denim Jeans",
        brand: { brand_id: 102, name: "DenimCo" },
        price: 45.5,
        description: "Comfortable classic fit denim jeans.",
        is_relevant: null,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 19,
                name: "Jeans",
                parent: { category_id: 2, name: "Clothing" },
            },
        ],
        subcategory: "Jeans",
        rank: 2,
        score: 0.78,
        text_score: 0.82,
        image_score: 0.74,
        combined_score: 0.78,
    },
    {
        product_id: "3",
        name: "Ergonomic Office Chair",
        brand: { brand_id: 103, name: "OfficePro" },
        price: 150.0,
        description: "An ergonomic chair for long hours at the desk.",
        is_relevant: null,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 11,
                name: "Furniture",
                parent: { category_id: 3, name: "Home" },
            },
        ],
        subcategory: "Furniture",
        rank: 3,
        score: 0.65,
        text_score: 0.7,
        image_score: 0.6,
        combined_score: 0.65,
    },
    {
        product_id: "4",
        name: "Smart Home Speaker",
        brand: { brand_id: 104, name: "TechLife" },
        price: 99.99,
        description: "Voice-activated smart speaker with great sound.",
        is_relevant: null,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 20,
                name: "Audio",
                parent: { category_id: 1, name: "Electronics" },
            },
        ],
        subcategory: "Audio",
        rank: 4,
        score: 0.88,
        text_score: 0.85,
        image_score: 0.91,
        combined_score: 0.88,
    },
];

const mockCategories = [
    { category_id: 1, name: "Electronics", parent_category_id: null },
    { category_id: 2, name: "Clothing", parent_category_id: null },
    { category_id: 3, name: "Home", parent_category_id: null },
    { category_id: 4, name: "Sports", parent_category_id: null },
    { category_id: 5, name: "Beauty", parent_category_id: null },
    { category_id: 6, name: "Books", parent_category_id: null },
    { category_id: 7, name: "Smartphones", parent_category_id: 1 },
    { category_id: 8, name: "Laptops", parent_category_id: 1 },
    { category_id: 9, name: "Men's Clothing", parent_category_id: 2 },
    { category_id: 10, name: "Women's Clothing", parent_category_id: 2 },
    { category_id: 11, name: "Furniture", parent_category_id: 3 },
    { category_id: 12, name: "Sports Equipment", parent_category_id: 4 },
    { category_id: 13, name: "Fitness Gear", parent_category_id: 4 },
    { category_id: 14, name: "Makeup", parent_category_id: 5 },
    { category_id: 15, name: "Skincare", parent_category_id: 5 },
    { category_id: 16, name: "Novels", parent_category_id: 6 },
    { category_id: 17, name: "Fiction", parent_category_id: 6 },
    { category_id: 18, name: "Jackets", parent_category_id: 2 },
    { category_id: 19, name: "Jeans", parent_category_id: 2 },
    { category_id: 20, name: "Audio", parent_category_id: 1 },
];

const mockBrands = [
    { brand_id: 101, name: "UrbanStyle" },
    { brand_id: 102, name: "DenimCo" },
    { brand_id: 103, name: "OfficePro" },
    { brand_id: 104, name: "TechLife" },
    { brand_id: 105, name: "Sporty" },
];

const retrievalModelCatalog = {
    textual_models: [
        { name: "ViT-B/32", dimension: 512 },
        { name: "BAAI/bge-large-en-v1.5", dimension: 1024 },
        { name: "Qwen/Qwen3-Embedding-8B", dimension: 4096 },
    ],
    visual_models: [{ name: "ViT-B/32", dimension: 512 }],
    defaults: {
        textual: "BAAI/bge-large-en-v1.5",
        visual: "ViT-B/32",
    },
};

const correctionModelCatalog = {
    engines: [
        { name: "symspell_keyboard", description: "Keyboard typo correction" },
        { name: "byt5", description: "Neural correction engine" },
        { name: "rawtext", description: "No correction applied" },
    ],
    defaults: {
        engine: "symspell_keyboard",
    },
};

let selectedRetrievalModels = {
    textual_model: retrievalModelCatalog.defaults.textual,
    visual_model: retrievalModelCatalog.defaults.visual,
    last_updated: new Date().toISOString(),
};

let selectedCorrectionEngine = correctionModelCatalog.defaults.engine;

let mockIndexStats: Record<
    string,
    {
        textual: number;
        visual: number;
        fused: number;
    }
> = {
    "bge-large-en-v1.5_1024_embeddings": {
        textual: 100,
        visual: 0,
        fused: 0,
    },
    "ViT-B-32_512_embeddings": {
        textual: 0,
        visual: 250,
        fused: 0,
    },
};

const generateMockAnalyticsData = () => {
    const data = [
        {
            search_id: 34,
            backend_total_time: 4139.71,
            correction_time: 2041.96,
            db_time: 13.26,
            faiss_time: 2082.95,
            product_load_duration: 513.2,
            search_duration: 4442.3,
            relevancy_score: 0.45,
            result_count: 12,
        },
        {
            search_id: 35,
            backend_total_time: 2091.63,
            correction_time: 0,
            db_time: 13.11,
            faiss_time: 2076.08,
            product_load_duration: 358.8,
            search_duration: 2530.1,
            relevancy_score: 0.92,
            result_count: 240,
        },
    ];

    for (let i = 0; i < 48; i++) {
        const hasCorrection = Math.random() > 0.8;
        const correction = hasCorrection ? 1500 + Math.random() * 1000 : 0;
        const faiss = 100 + Math.random() * 800;
        const db = 10 + Math.random() * 20;
        const overhead = 50 + Math.random() * 100;
        const backendTotal = correction + faiss + db + overhead;
        const networkLag = 50 + Math.random() * 300;
        const searchDuration = backendTotal + networkLag;
        const productLoad = 200 + Math.random() * 400;
        const relevancy = 0.3 + Math.random() * 0.7;
        const count = Math.floor(Math.random() * 500);

        data.push({
            search_id: 100 + i,
            backend_total_time: backendTotal,
            correction_time: correction,
            db_time: db,
            faiss_time: faiss,
            product_load_duration: productLoad,
            search_duration: searchDuration,
            relevancy_score: relevancy,
            result_count: count,
        });
    }
    return data.sort((a, b) => b.search_duration - a.search_duration);
};

export const handlers = [
    // Retrieval Models
    http.get("/api/retrieval/models", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({
            status: "success",
            data: retrievalModelCatalog,
        });
    }),

    // Retrieval Index Stats
    http.get("/api/retrieval/index-stats", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({
            status: "success",
            indices: mockIndexStats,
        });
    }),

    // Retrieval Overall Stats
    http.get("/api/retrieval/stats", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({
            status: "success",
            data: {
                index_stats: mockIndexStats,
                available_models: retrievalModelCatalog,
                selected_models: selectedRetrievalModels,
                service_status: "healthy",
            },
        });
    }),

    // Save and Rebuild Retrieval Models
    http.post("/api/retrieval/selected-models/save-and-rebuild", async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const body = (await request.json()) as {
            textual_model: string;
            visual_model: string;
            fusion_endpoint: string;
            wait_duration_seconds?: number;
        };

        const totalProducts = mockProducts.length;
        const failedCount = Math.min(2, Math.floor(Math.random() * 3));
        const successfulCount = totalProducts - failedCount;

        selectedRetrievalModels = {
            textual_model: body.textual_model,
            visual_model: body.visual_model,
            last_updated: new Date().toISOString(),
        };

        mockIndexStats = {
            ...mockIndexStats,
            [`${body.textual_model.replaceAll("/", "-")}_${retrievalModelCatalog.textual_models.find((m) => m.name === body.textual_model)?.dimension ?? 1024}_embeddings`]:
                {
                    textual: successfulCount,
                    visual: 0,
                    fused: 0,
                },
            [`${body.visual_model.replaceAll("/", "-")}_${retrievalModelCatalog.visual_models.find((m) => m.name === body.visual_model)?.dimension ?? 512}_embeddings`]:
                {
                    textual: 0,
                    visual: successfulCount,
                    fused: 0,
                },
        };

        return HttpResponse.json({
            status: "success",
            data: {
                textual_model: selectedRetrievalModels.textual_model,
                visual_model: selectedRetrievalModels.visual_model,
                total_products: totalProducts,
                successful_count: successfulCount,
                failed_count: failedCount,
                total_duration_ms: 125000,
            },
            errors: failedCount ? [{ product_id: "mock-product-failed", reason: "Mock processing error" }] : [],
        });
    }),

    // Correction Models
    http.get("/api/correction/models", async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return HttpResponse.json({
            status: "success",
            data: {
                ...correctionModelCatalog,
                defaults: {
                    engine: selectedCorrectionEngine,
                },
            },
        });
    }),

    // Save Correction Engine
    http.post("/api/correction/selected-engine/save", async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const body = (await request.json()) as {
            engine: string;
        };

        selectedCorrectionEngine = body.engine;

        return HttpResponse.json({
            status: "success",
            message: "Correction engine saved successfully",
            data: {
                engine: selectedCorrectionEngine,
            },
        });
    }),

    // 1. Search Request
    http.post("/api/search", async ({ request }) => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const rawTextFlag = formData.get("raw_text_flag");

            if (rawTextFlag === "true") {
                const searchId = formData.get("search_id");
                console.log("Mock Raw Text Request Received:", {
                    search_id: searchId,
                    raw_text_flag: rawTextFlag,
                });
            } else {
                const rawText = formData.get("raw_text");
                const images = formData.get("images");
                const correctionEnabled = formData.get("correction_enabled");

                console.log("Mock Search Request Received:", {
                    raw_text: rawText,
                    images: images instanceof File ? `File: ${images.name} (${images.size} bytes)` : images,
                    correction_enabled: correctionEnabled,
                });
            }
        } else if (contentType.includes("application/json")) {
            const json = await request.json();
            console.log("Mock JSON Request Received:", json);
        }

        // Return a fake search ID
        return HttpResponse.json({
            search_id: "search-" + Math.random().toString(36).substr(2, 9),
        });
    }),

    // DB Fallback (traditional search comparison)
    http.post("/api/search/db-fallback", async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const body = (await request.json()) as { search_id: string };
        console.log("Mock DB Fallback Request:", body);

        return HttpResponse.json({
            original_search_id: body.search_id,
            search_text: "corrected text example",
            products: [
                {
                    product_id: 3,
                    name: "Ergonomic Office Chair",
                    price: 150.0,
                    score: 1.0,
                    brand: { brand_id: 103, name: "OfficePro" },
                    images: ["https://placehold.co/400"],
                },
                {
                    product_id: 2,
                    name: "Classic Denim Jeans",
                    price: 45.5,
                    score: 0.85,
                    brand: { brand_id: 102, name: "DenimCo" },
                    images: ["https://placehold.co/400"],
                },
                {
                    product_id: 4,
                    name: "Smart Home Speaker",
                    price: 99.99,
                    score: 0.6,
                    brand: { brand_id: 104, name: "TechLife" },
                    images: ["https://placehold.co/400"],
                },
            ],
        });
    }),

    // 2. Get Search Results
    http.get("/api/search/:searchId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const { searchId } = params;

        return HttpResponse.json({
            products: mockProducts,
            corrected_text: "corrected text example",
            raw_text: "raw query text",
            search_id: searchId,
            fusion_type: "late_fusion",
            textual_model_name: selectedRetrievalModels.textual_model,
            visual_model_name: selectedRetrievalModels.visual_model,
        });
    }),

    // 3. Get Raw Text Results
    http.get("/api/raw-text-results/:searchId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
            text: "raw text result for " + params.searchId,
        });
    }),

    // 4. Get Product By ID
    http.get("/api/products/:productId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const product = mockProducts.find((p) => p.product_id === params.productId);

        if (!product) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(product);
    }),

    // Get Product Images
    http.get("/api/products/:productId/images", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const product = mockProducts.find((p) => p.product_id === params.productId);

        if (!product) {
            return new HttpResponse(null, { status: 404 });
        }

        const images = product.images.map((url, index) => ({
            image_id: index + 1,
            url: url,
        }));

        return HttpResponse.json({
            product_id: product.product_id,
            images: images,
            total: images.length,
        });
    }),

    // Get All Products
    http.get("/api/products", async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return HttpResponse.json(mockProducts);
    }),

    // 5. Create Product
    http.post("/api/products", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ success: true, id: "new-product-id-" + Date.now() });
    }),

    // Update Product
    http.put("/api/products/:productId", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ success: true });
    }),

    // 6. Vote/Feedback
    http.post("/api/feedback", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({}); // Returns void in api.ts, so empty json or just status 200 is fine
    }),

    // 7. Get Categories
    http.get("/api/categories", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
            categories: mockCategories,
            total: mockCategories.length,
        });
    }),

    // 8. Get Brands
    http.get("/api/brands", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({ brands: mockBrands });
    }),

    // 9. Delete Product
    http.delete("/api/products/:productId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const { productId } = params;
        mockProducts = mockProducts.filter((p) => p.product_id !== productId);
        return HttpResponse.json({ success: true });
    }),

    // 10. Record Search Duration
    http.post("/api/analytics/search-duration", async ({ request }) => {
        const body = await request.json();
        console.log("Analytics received:", body);
        return HttpResponse.json({ success: true });
    }),

    // 11. Get Analytics Logs
    http.get("/api/analytics/logs", async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return HttpResponse.json(generateMockAnalyticsData());
    }),
];
