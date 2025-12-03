import { http, HttpResponse } from "msw";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const mockProducts = [
    {
        id: "1",
        title: "Vintage Leather Jacket",
        description: "A stylish vintage leather jacket.",
        price: currencyFormatter.format(10.99),
        images: ["https://placehold.co/400"],
        category: "Clothing",
        subcategory: "Jackets",
    },
    {
        id: "2",
        title: "Classic Denim Jeans",
        description: "Comfortable classic fit denim jeans.",
        price: currencyFormatter.format(20.97),
        images: ["https://placehold.co/400"],
        category: "Clothing",
        subcategory: "Jeans",
    },
    {
        id: "3",
        title: "Ergonomic Office Chair",
        description: "An ergonomic chair for long hours at the desk.",
        price: currencyFormatter.format(30.5),
        images: ["https://placehold.co/400"],
        category: "Home",
        subcategory: "Furniture",
    },
    {
        id: "4",
        title: "Smart Home Speaker",
        description: "Voice-activated smart speaker with great sound.",
        price: currencyFormatter.format(40.99),
        images: ["https://placehold.co/400"],
        category: "Home",
        subcategory: "Electronics",
    },
];

export const handlers = [
    // 1. Search Request
    http.post("/api/search", async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Return a fake search ID
        return HttpResponse.json({
            searchId: "search-" + Math.random().toString(36).substr(2, 9),
        });
    }),

    // 2. Get Search Results
    http.get("/api/search-results/:searchId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const { searchId } = params;

        return HttpResponse.json({
            products: mockProducts,
            correctedText: "corrected text",
            rawText: "raw text",
            searchId,
        });
    }),

    // 3. Get Raw Text Results (Simulating a different endpoint logic)
    http.get("/api/raw-text-results/:searchId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
            text: "raw text " + params.searchId,
        });
    }),

    // 4. Get Product By ID
    http.get("/api/products/:productId", async ({ params }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const product = mockProducts.find((p) => p.id === params.productId);

        if (!product) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(product);
    }),

    // 5. Create Product (New)
    http.post("/api/products", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ success: true, id: "new-product-id" });
    }),

    // 6. Vote Product (New)
    http.post("/api/products/:productId/vote", async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return HttpResponse.json({ success: true });
    }),

    // 7. Upload Image (New)
    http.post("/api/upload", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ url: "https://placehold.co/400" });
    }),

    // 8. Get Taxonomy/Categories (New)
    http.get("/api/taxonomy", async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
            Engineering: ["Frontend", "Backend", "DevOps", "Mobile", "QA"],
            Design: ["UI Design", "UX Research", "Graphic Design", "Motion", "Branding"],
            Marketing: ["SEO", "Content", "Social Media", "Email", "Research"],
            Product: ["Roadmap", "Specs", "User Research", "Analytics"],
            Clothing: ["T-Shirts", "Jeans", "Jackets", "Shoes", "Accessories"],
            Home: ["Decor", "Kitchen", "Bedding", "Lighting", "Furniture"],
        });
    }),
];
