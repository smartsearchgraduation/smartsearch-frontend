import { http, HttpResponse } from "msw";

let mockProducts = [
    {
        product_id: "1",
        name: "Vintage Leather Jacket",
        brand: { brand_id: 101, name: "UrbanStyle" },
        price: 89.99,
        description: "A stylish vintage leather jacket.",
        is_relevant: true,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 18,
                name: "Jackets",
                parent: { category_id: 2, name: "Clothing" },
            },
        ],
        subcategory: "Jackets",
    },
    {
        product_id: "2",
        name: "Classic Denim Jeans",
        brand: { brand_id: 102, name: "DenimCo" },
        price: 45.5,
        description: "Comfortable classic fit denim jeans.",
        is_relevant: true,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 19,
                name: "Jeans",
                parent: { category_id: 2, name: "Clothing" },
            },
        ],
        subcategory: "Jeans",
    },
    {
        product_id: "3",
        name: "Ergonomic Office Chair",
        brand: { brand_id: 103, name: "OfficePro" },
        price: 150.0,
        description: "An ergonomic chair for long hours at the desk.",
        is_relevant: false,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 11,
                name: "Furniture",
                parent: { category_id: 3, name: "Home" },
            },
        ],
        subcategory: "Furniture",
    },
    {
        product_id: "4",
        name: "Smart Home Speaker",
        brand: { brand_id: 104, name: "TechLife" },
        price: 99.99,
        description: "Voice-activated smart speaker with great sound.",
        is_relevant: true,
        images: ["https://placehold.co/400", "https://placehold.co/500", "https://placehold.co/600"],
        categories: [
            {
                category_id: 20,
                name: "Audio",
                parent: { category_id: 1, name: "Electronics" },
            },
        ],
        subcategory: "Audio",
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
    // 1. Search Request
    http.post("/api/search", async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Return a fake search ID
        return HttpResponse.json({
            search_id: "search-" + Math.random().toString(36).substr(2, 9),
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
