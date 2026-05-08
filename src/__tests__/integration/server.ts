import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

/**
 * Default MSW handlers for the frontend_to_backend integration suite.
 *
 * Tests are expected to override these per-case with `server.use(...)`.
 * The base handlers below provide deterministic, minimal responses so
 * that any test that forgets to override does not silently make a real
 * network request.
 */
const placeholderImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3C/svg%3E";

export const mockProducts = [
    {
        product_id: "1",
        name: "Vintage Leather Jacket",
        brand: { brand_id: 101, name: "UrbanStyle" },
        price: 89.99,
        description: "A stylish vintage leather jacket.",
        is_relevant: null,
        images: [placeholderImage],
        categories: [{ category_id: 18, name: "Jackets", parent: { category_id: 2, name: "Clothing" } }],
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
        images: [placeholderImage],
        categories: [{ category_id: 19, name: "Jeans", parent: { category_id: 2, name: "Clothing" } }],
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
        images: [placeholderImage],
        categories: [{ category_id: 11, name: "Furniture", parent: { category_id: 3, name: "Home" } }],
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
        images: [placeholderImage],
        categories: [{ category_id: 20, name: "Audio", parent: { category_id: 1, name: "Electronics" } }],
        subcategory: "Audio",
        rank: 4,
        score: 0.88,
        text_score: 0.85,
        image_score: 0.91,
        combined_score: 0.88,
    },
];

export const defaultDbFallbackProducts = [
    {
        product_id: 3,
        name: "Ergonomic Office Chair",
        price: 150.0,
        score: 1.0,
        brand: { brand_id: 103, name: "OfficePro" },
        images: [placeholderImage],
        is_relevant: null,
    },
    {
        product_id: 2,
        name: "Classic Denim Jeans",
        price: 45.5,
        score: 0.85,
        brand: { brand_id: 102, name: "DenimCo" },
        images: [placeholderImage],
        is_relevant: null,
    },
    {
        product_id: 4,
        name: "Smart Home Speaker",
        price: 99.99,
        score: 0.6,
        brand: { brand_id: 104, name: "TechLife" },
        images: [placeholderImage],
        is_relevant: null,
    },
];

const defaultHandlers = [
    http.post("/api/search", async () => HttpResponse.json({ search_id: "search-default" })),
    http.get("/api/search/:searchId", async ({ params }) =>
        HttpResponse.json({
            products: mockProducts,
            corrected_text: "raw query text",
            raw_text: "raw query text",
            search_id: params.searchId,
            fusion_type: "late_fusion",
            textual_model_name: "BAAI/bge-large-en-v1.5",
            visual_model_name: "ViT-B/32",
            search_mode: "std",
            correction_enabled: true,
        }),
    ),
    http.post("/api/search/db-fallback", async ({ request }) => {
        const body = (await request.json()) as { search_id: string };
        return HttpResponse.json({
            original_search_id: body.search_id,
            search_text: "fallback example",
            products: defaultDbFallbackProducts,
        });
    }),
    http.get("/api/products/:productId", async ({ params }) => {
        const product = mockProducts.find((p) => p.product_id === params.productId);
        if (!product) return new HttpResponse(null, { status: 404 });
        return HttpResponse.json(product);
    }),
    http.post("/api/feedback", async () => HttpResponse.json({})),
    http.post("/api/analytics/search-duration", async () => HttpResponse.json({ success: true })),
];

export const server = setupServer(...defaultHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
