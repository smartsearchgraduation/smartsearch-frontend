import { http, HttpResponse } from "msw";

const mockProducts = [
    {
        product_id: "1",
        name: "Vintage Leather Jacket",
        brand: { brand_id: 101, name: "UrbanStyle" },
        price: 89.99,
        description: "A stylish vintage leather jacket.",
        is_relevant: true,
        images: ["https://placehold.co/400"],
        categories: [
            { category_id: 2, name: "Clothing", parent: null },
        ],
        subcategory: "Jackets",
    },
    {
        product_id: "2",
        name: "Classic Denim Jeans",
        brand: { brand_id: 102, name: "DenimCo" },
        price: 45.50,
        description: "Comfortable classic fit denim jeans.",
        is_relevant: true,
        images: ["https://placehold.co/400"],
        categories: [
            { category_id: 2, name: "Clothing", parent: null },
        ],
        subcategory: "Jeans",
    },
    {
        product_id: "3",
        name: "Ergonomic Office Chair",
        brand: { brand_id: 103, name: "OfficePro" },
        price: 150.00,
        description: "An ergonomic chair for long hours at the desk.",
        is_relevant: false,
        images: ["https://placehold.co/400"],
        categories: [
            { category_id: 3, name: "Home", parent: null },
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
        images: ["https://placehold.co/400"],
        categories: [
            { category_id: 1, name: "Electronics", parent: null },
        ],
        subcategory: "Audio",
    },
];

const mockCategories = [
    { category_id: 1, name: "Electronics", parent_category_id: null },
    { category_id: 2, name: "Clothing", parent_category_id: null },
    { category_id: 3, name: "Home", parent_category_id: null },
    { category_id: 4, name: "Sports", parent_category_id: null },
    { category_id: 7, name: "Smartphones", parent_category_id: 1 },
    { category_id: 8, name: "Laptops", parent_category_id: 1 },
    { category_id: 9, name: "Men's Clothing", parent_category_id: 2 },
    { category_id: 10, name: "Women's Clothing", parent_category_id: 2 },
];

const mockBrands = [
    { brand_id: 101, name: "UrbanStyle" },
    { brand_id: 102, name: "DenimCo" },
    { brand_id: 103, name: "OfficePro" },
    { brand_id: 104, name: "TechLife" },
    { brand_id: 105, name: "Sporty" },
];

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

    // 2. Get Search Results (Changed from search-results to search/:searchId to match api.ts)
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

    // 5. Create Product
    http.post("/api/products", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ success: true, id: "new-product-id-" + Date.now() });
    }),

    // 6. Vote/Feedback (Changed from products/vote to feedback)
    http.post("/api/feedback", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({}); // Returns void in api.ts, so empty json or just status 200 is fine
    }),

    // 7. Get Categories
    http.get("/api/categories", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
            categories: mockCategories,
            total: mockCategories.length
        });
    }),

    // 8. Get Brands (New)
    http.get("/api/brands", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json(mockBrands);
    }),
];