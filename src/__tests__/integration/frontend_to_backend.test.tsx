/**
 * Integration tests — frontend_to_backend
 *
 * One test per row of frontend_to_backend.md (FB-INT-001 .. FB-INT-028).
 * MSW intercepts /api/* calls; production code under src/lib, src/components,
 * and src/pages is exercised against those mocks.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";

import { server, mockProducts } from "./server";
import HomePage from "../../pages/HomePage";
import SearchPage from "../../pages/SearchPage";
import ProductPage from "../../pages/ProductPage";

// ---------- jsdom polyfills ----------
// canvas.toBlob is needed by useSearchImage's WebP conversion path.
if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback, type = "image/webp") {
        const blob = new Blob(["mock-image-bytes"], { type });
        cb(blob);
    };
    // @ts-expect-error - patch getContext so ctx.drawImage is callable
    HTMLCanvasElement.prototype.getContext = function () {
        return { drawImage: () => {} };
    };
}

// Image.onload firing reliably in jsdom: emulate a successful load synchronously.
if (typeof Image !== "undefined") {
    type OriginalImage = typeof globalThis.Image;
    class MockImage {
        public src = "";
        public onload: (() => void) | null = null;
        public onerror: ((e: unknown) => void) | null = null;
        public width = 100;
        public height = 100;
        constructor() {
            setTimeout(() => {
                this.onload?.();
            }, 0);
        }
    }
    // Only override if the default jsdom Image does not auto-fire onload.
    // We always replace because jsdom does not really decode images.
    globalThis.Image = MockImage as unknown as OriginalImage;
}

// URL.createObjectURL polyfill (used by useSearchImage for previews).
if (typeof URL !== "undefined" && typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = vi.fn(() => "blob:mock-preview");
    URL.revokeObjectURL = vi.fn();
}

// ---------- Helpers ----------
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

interface RenderOpts {
    initialEntries?: string[];
    routes?: React.ReactNode;
}

function renderWithProviders(ui: React.ReactElement, opts: RenderOpts = {}) {
    const client = makeQueryClient();
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={opts.initialEntries ?? ["/"]}>
                {opts.routes ? <Routes>{opts.routes}</Routes> : ui}
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

function renderHomeWithRoutes(extra?: React.ReactNode) {
    const routes = (
        <>
            <Route path="/" element={<HomePage />} />
            <Route path="/search/:searchId" element={<DestinationProbe />} />
            {extra}
        </>
    );
    return renderWithProviders(<></>, { initialEntries: ["/"], routes });
}

function DestinationProbe() {
    const params = useParams();
    const location = useLocation();
    return (
        <div data-testid="destination">
            <span data-testid="dest-searchId">{params.searchId}</span>
            <span data-testid="dest-state">{JSON.stringify(location.state ?? {})}</span>
        </div>
    );
}

beforeEach(() => {
    sessionStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ============================================================
// FB-INT-001
// ============================================================
describe("FB-INT-001", () => {
    it("FB-INT-001 — submitting a text-only query posts FormData with expected fields", async () => {
        // FB-INT-001: Verify that submitting a text-only query from HomePage
        // posts a multipart FormData body to POST /api/search with the expected fields.
        let captured: Record<string, FormDataEntryValue | null> | null = null;
        server.use(
            http.post("/api/search", async ({ request }) => {
                const fd = await request.formData();
                captured = {
                    raw_text: fd.get("raw_text"),
                    images: fd.get("images"),
                    correction_enabled: fd.get("correction_enabled"),
                    search_mode: fd.get("search_mode"),
                };
                return HttpResponse.json({ search_id: "search-abc" });
            }),
        );

        // --- Step 1-3: render and submit
        renderHomeWithRoutes();
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox"), "vintage leather jacket");
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        // --- Expected Output
        await waitFor(() => expect(captured).not.toBeNull());
        expect(captured!.raw_text).toBe("vintage leather jacket");
        expect(captured!.images).toBeNull();
        expect(captured!.correction_enabled).toBe("true");
        expect(captured!.search_mode).toBe("std");
    });
});

// ============================================================
// FB-INT-002
// ============================================================
describe("FB-INT-002", () => {
    it("FB-INT-002 — successful search navigates to /search/:id with searchDuration in state", async () => {
        // FB-INT-002: Verify navigation to /search/:searchId with searchDuration in location.state.
        server.use(
            http.post("/api/search", async () => {
                await delay(50);
                return HttpResponse.json({ search_id: "search-xyz123" });
            }),
        );

        renderHomeWithRoutes();
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox"), "denim jeans");
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        await waitFor(() => {
            expect(screen.getByTestId("dest-searchId").textContent).toBe("search-xyz123");
        });
        const stateText = screen.getByTestId("dest-state").textContent ?? "{}";
        const parsed = JSON.parse(stateText) as { searchDuration?: number };
        expect(typeof parsed.searchDuration).toBe("number");
        expect(parsed.searchDuration!).toBeGreaterThan(0);
        expect(Number.isFinite(parsed.searchDuration!)).toBe(true);
    });
});

// ============================================================
// FB-INT-003
// ============================================================
describe("FB-INT-003", () => {
    it("FB-INT-003 — submit button disabled when text empty and no image", async () => {
        // FB-INT-003: Verify submit disabled and no /api/search fired when both empty.
        let count = 0;
        server.use(
            http.post("/api/search", async () => {
                count += 1;
                return HttpResponse.json({ search_id: "x" });
            }),
        );

        renderHomeWithRoutes();
        const submit = screen.getByRole("button", { name: /submit search/i });
        expect(submit).toBeDisabled();

        // Clicking a disabled button should not fire the request.
        const user = userEvent.setup();
        await user.click(submit);
        // Give react-query a tick.
        await new Promise((r) => setTimeout(r, 30));
        expect(count).toBe(0);
    });
});

// ============================================================
// FB-INT-004
// ============================================================
describe("FB-INT-004", () => {
    it("FB-INT-004 — toggling correction off changes correction_enabled to 'false'", async () => {
        // FB-INT-004: Verify toggling spell-correction button changes correction_enabled.
        let captured: FormData | null = null;
        server.use(
            http.post("/api/search", async ({ request }) => {
                captured = await request.formData();
                return HttpResponse.json({ search_id: "s-1" });
            }),
        );

        renderHomeWithRoutes();
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox"), "iphon 15");
        const toggle = screen.getByRole("button", { name: /spell correction, on/i });
        await user.click(toggle);
        // After click, label flips
        const toggleAfter = screen.getByRole("button", { name: /spell correction, off/i });
        expect(toggleAfter.getAttribute("aria-pressed")).toBe("false");

        await user.click(screen.getByRole("button", { name: /submit search/i }));

        await waitFor(() => expect(captured).not.toBeNull());
        expect(captured!.get("correction_enabled")).toBe("false");
    });
});

// ============================================================
// FB-INT-005
// ============================================================
describe("FB-INT-005", () => {
    it("FB-INT-005 — selecting search mode 'iwt' propagates to FormData", async () => {
        // FB-INT-005: Verify selecting iwt sends search_mode="iwt".
        let captured: FormData | null = null;
        server.use(
            http.post("/api/search", async ({ request }) => {
                captured = await request.formData();
                return HttpResponse.json({ search_id: "s-iwt" });
            }),
        );

        renderHomeWithRoutes();
        const user = userEvent.setup();
        // Open menu
        await user.click(screen.getByRole("button", { name: /current mode: std/i }));
        // The menu has buttons named "iwt"
        const iwtButton = screen.getByRole("button", { name: "iwt" });
        await user.click(iwtButton);

        await user.type(screen.getByRole("textbox"), "red sneakers");
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        await waitFor(() => expect(captured).not.toBeNull());
        expect(captured!.get("search_mode")).toBe("iwt");
        expect(captured!.get("raw_text")).toBe("red sneakers");
    });
});

// ============================================================
// FB-INT-006
// ============================================================
describe("FB-INT-006", () => {
    it("FB-INT-006 — twi mode disables textarea and requires an image", async () => {
        // FB-INT-006: Verify twi mode requires image to submit.
        let count = 0;
        server.use(
            http.post("/api/search", async ({ request }) => {
                count += 1;
                const fd = await request.formData();
                return HttpResponse.json({
                    search_id: "s-twi-" + count,
                    _seen: { name: (fd.get("images") as File | null)?.name ?? null },
                });
            }),
        );

        renderHomeWithRoutes();
        const user = userEvent.setup();
        // pick twi
        await user.click(screen.getByRole("button", { name: /current mode: std/i }));
        await user.click(screen.getByRole("button", { name: "twi" }));
        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeDisabled();

        const submit = screen.getByRole("button", { name: /submit search/i });
        // Without image, submit should be disabled or yield no request.
        await user.click(submit);
        await new Promise((r) => setTimeout(r, 30));
        expect(count).toBe(0);

        // Attach an image via the hidden file input
        const fileInput = document.querySelector('input[aria-label="Add image"]') as HTMLInputElement;
        const file = new File(["bytes"], "shoe.png", { type: "image/png" });
        await act(async () => {
            await user.upload(fileInput, file);
            // Allow useEffect that derives previewUrl / image conversion to settle
            await new Promise((r) => setTimeout(r, 20));
        });

        // Re-query submit after state update
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /submit search/i })).not.toBeDisabled();
        });
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        await waitFor(() => expect(count).toBe(1));
    });
});

// ============================================================
// FB-INT-008
// ============================================================
describe("FB-INT-008", () => {
    it("FB-INT-008 — SearchPage fetches results and renders one ProductCard per product", async () => {
        // FB-INT-008: Verify GET /api/search/:searchId is fetched and ProductCards render.
        renderWithProviders(<></>, {
            initialEntries: ["/search/search-xyz"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await waitFor(() => {
            expect(screen.getByText(/UrbanStyle/)).toBeInTheDocument();
            expect(screen.getByText(/DenimCo/)).toBeInTheDocument();
            expect(screen.getByText(/OfficePro/)).toBeInTheDocument();
            expect(screen.getByText(/TechLife/)).toBeInTheDocument();
        });

        // ProductCards expose like/dislike buttons; count them and divide by 2.
        const likeButtons = screen.getAllByRole("button", { name: /product is relevant/i });
        expect(likeButtons.length).toBe(4);
    });
});

// ============================================================
// FB-INT-009
// ============================================================
describe("FB-INT-009", () => {
    it("FB-INT-009 — corrected_text differs from raw_text shows 'Showing results for' block", async () => {
        // FB-INT-009: Verify corrected vs raw text shows "Showing results for" + raw button.
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: mockProducts,
                    corrected_text: "leather jacket",
                    raw_text: "lether jakcet",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        const heading = await screen.findByRole("heading", { name: /Showing results for:/ });
        expect(heading).toBeInTheDocument();
        // The corrected text appears as a span inside the heading. Scope the
        // query to the heading so we don't also match the textarea content,
        // which is intentionally synced from corrected_text via SearchBar.
        expect(within(heading).getByText("leather jacket")).toBeInTheDocument();
        // The raw text appears as a button label.
        expect(screen.getByRole("button", { name: "lether jakcet" })).toBeInTheDocument();
    });
});

// ============================================================
// FB-INT-010
// ============================================================
describe("FB-INT-010", () => {
    it("FB-INT-010 — clicking 'Search instead for' posts new search with correction_enabled=false", async () => {
        // FB-INT-010: Verify raw-text re-search uses correction_enabled=false.
        let capturedSearch: FormData | null = null;
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: mockProducts,
                    corrected_text: "leather jacket",
                    raw_text: "lether jakcet",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
            http.post("/api/search", async ({ request }) => {
                capturedSearch = await request.formData();
                return HttpResponse.json({ search_id: "search-raw" });
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: (
                <>
                    <Route path="/search/:searchId" element={<SearchPage />} />
                </>
            ),
        });

        const user = userEvent.setup();
        const rawButton = await screen.findByRole("button", { name: "lether jakcet" });
        await user.click(rawButton);

        await waitFor(() => expect(capturedSearch).not.toBeNull());
        expect(capturedSearch!.get("raw_text")).toBe("lether jakcet");
        expect(capturedSearch!.get("correction_enabled")).toBe("false");
    });
});

// ============================================================
// FB-INT-011
// ============================================================
describe("FB-INT-011", () => {
    it("FB-INT-011 — toggling semantic search off triggers db-fallback and renders mapped products", async () => {
        // FB-INT-011: Verify db-fallback path renders 3 mapped products.
        let fallbackBody: unknown = null;
        server.use(
            http.post("/api/search/db-fallback", async ({ request }) => {
                fallbackBody = await request.json();
                return HttpResponse.json({
                    original_search_id: 1,
                    search_text: "fallback",
                    products: [
                        {
                            product_id: 3,
                            name: "Office Chair",
                            price: 150,
                            score: 1.0,
                            brand: { brand_id: 103, name: "OfficePro" },
                            images: [],
                            is_relevant: null,
                        },
                        {
                            product_id: 2,
                            name: "Denim Jeans",
                            price: 45,
                            score: 0.85,
                            brand: { brand_id: 102, name: "DenimCo" },
                            images: [],
                            is_relevant: null,
                        },
                        {
                            product_id: 4,
                            name: "Smart Speaker",
                            price: 99,
                            score: 0.6,
                            brand: { brand_id: 104, name: "TechLife" },
                            images: [],
                            is_relevant: null,
                        },
                    ],
                });
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        // Wait for initial semantic results to load
        await screen.findByText(/UrbanStyle/);

        // Click switch (it's an input type=checkbox)
        const user = userEvent.setup();
        const semanticSwitch = document.getElementById("semantic-search") as HTMLInputElement;
        await user.click(semanticSwitch);

        await waitFor(() => {
            expect(screen.getByText(/OfficePro/)).toBeInTheDocument();
            expect(screen.getByText(/DenimCo/)).toBeInTheDocument();
            expect(screen.getByText(/TechLife/)).toBeInTheDocument();
        });
        expect(fallbackBody).toEqual({ search_id: "search-1" });
    });
});

// ============================================================
// FB-INT-012
// ============================================================
describe("FB-INT-012", () => {
    it("FB-INT-012 — 500 from GET /api/search/:id renders error region", async () => {
        // FB-INT-012: Verify HTTP 500 surfaces as role=alert with thrown message.
        server.use(http.get("/api/search/:searchId", async () => new HttpResponse(null, { status: 500 })));

        renderWithProviders(<></>, {
            initialEntries: ["/search/err-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        const alert = await screen.findByRole("alert");
        expect(alert.textContent).toMatch(/Failed to get results/);
    });
});

// ============================================================
// FB-INT-013
// ============================================================
describe("FB-INT-013", () => {
    it("FB-INT-013 — empty products renders 'No products found.' status", async () => {
        // FB-INT-013: Verify empty products array yields role=status "No products found."
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: [],
                    corrected_text: "x",
                    raw_text: "x",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/empty-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await waitFor(() => {
            const statuses = screen.getAllByRole("status");
            expect(statuses.some((s) => /No products found\./.test(s.textContent ?? ""))).toBe(true);
        });
    });
});

// ============================================================
// FB-INT-014
// ============================================================
describe("FB-INT-014", () => {
    it("FB-INT-014 — SearchResponse fields propagate into SearchBar props", async () => {
        // FB-INT-014: Verify SearchBar reflects override values (mode twi, correction off, image).
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: mockProducts.slice(0, 1),
                    corrected_text: "bag",
                    raw_text: "bgg",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    query_image: {
                        filename: "q.jpg",
                        url: "/u/q.jpg",
                        data_url: "data:image/jpeg;base64,AAAA",
                    },
                    search_mode: "twi",
                    correction_enabled: false,
                }),
            ),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-twi"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await waitFor(() => {
            // Spell correction toggle is "off"
            const correctionBtn = screen.getByRole("button", { name: /spell correction, off/i });
            expect(correctionBtn.getAttribute("aria-pressed")).toBe("false");
        });
        // Mode menu reflects twi
        expect(screen.getByRole("button", { name: /current mode: twi/i })).toBeInTheDocument();
        // Preview image rendered (alt is empty when no imageFile)
        const img = document.querySelector('img[src^="data:image/jpeg"]') as HTMLImageElement | null;
        expect(img).not.toBeNull();
    });
});

// ============================================================
// FB-INT-015
// ============================================================
describe("FB-INT-015", () => {
    it("FB-INT-015 — clicking product card link navigates to /product/:id and fetches it", async () => {
        // FB-INT-015: Verify navigation to ProductPage triggers GET /api/products/:id.
        let productUrl: string | null = null;
        server.use(
            http.get("/api/products/:productId", async ({ request, params }) => {
                productUrl = new URL(request.url).pathname;
                const product = mockProducts.find((p) => p.product_id === params.productId);
                if (!product) return new HttpResponse(null, { status: 404 });
                return HttpResponse.json(product);
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-15"],
            routes: (
                <>
                    <Route path="/search/:searchId" element={<SearchPage />} />
                    <Route path="/product/:productId" element={<ProductPage />} />
                </>
            ),
        });

        // Wait for cards
        await screen.findByText(/UrbanStyle/);

        const user = userEvent.setup();
        // Click the link for product id 1: there are two links (image + heading), pick the first.
        const links = document.querySelectorAll('a[href="/product/1"]');
        expect(links.length).toBeGreaterThan(0);
        await user.click(links[0]);

        await waitFor(() => expect(productUrl).toBe("/api/products/1"));
        // Brand UrbanStyle and price 89.99 should appear on the product page.
        await waitFor(() => {
            expect(screen.getAllByText(/UrbanStyle/).length).toBeGreaterThan(0);
            expect(screen.getByText(/\$89\.99/)).toBeInTheDocument();
        });
    });
});

// ============================================================
// FB-INT-016
// ============================================================
describe("FB-INT-016", () => {
    it("FB-INT-016 — ProductPage renders error alert on 404", async () => {
        // FB-INT-016: Verify 404 renders role=alert with "Product not found" message.
        server.use(http.get("/api/products/:productId", async () => new HttpResponse(null, { status: 404 })));

        renderWithProviders(<></>, {
            initialEntries: ["/product/9999"],
            routes: <Route path="/product/:productId" element={<ProductPage />} />,
        });

        const alert = await screen.findByRole("alert");
        expect(alert.textContent).toMatch(/Product not found/);
    });
});

// ============================================================
// FB-INT-017
// ============================================================
describe("FB-INT-017", () => {
    it("FB-INT-017 — clicking like on a card posts feedback with correct JSON body", async () => {
        // FB-INT-017: Verify POST /api/feedback body is the expected JSON.
        let captured: unknown = null;
        server.use(
            http.post("/api/feedback", async ({ request }) => {
                captured = await request.json();
                return HttpResponse.json({});
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await screen.findByText(/UrbanStyle/);

        // Find the like button on the second card (product id 2 = DenimCo)
        const denimCard =
            screen.getByText(/DenimCo/).closest("div.group, .group, [class*='group']") ??
            screen.getByText(/DenimCo/).closest("div") ??
            document.body;
        // Fallback: get all like buttons and pick the second one (cards rendered in product order 1..4)
        const allLikes = screen.getAllByRole("button", { name: /product is relevant/i });
        // Index 1 corresponds to product_id 2.
        const user = userEvent.setup();
        await user.click(allLikes[1]);

        await waitFor(() => expect(captured).not.toBeNull());
        expect(captured).toEqual({ query_id: "search-1", product_id: "2", is_relevant: true });
        // Optimistic aria-pressed
        expect(allLikes[1].getAttribute("aria-pressed")).toBe("true");
        void denimCard;
    });
});

// ============================================================
// FB-INT-018
// ============================================================
describe("FB-INT-018", () => {
    it("FB-INT-018 — vote click optimistically updates aria-pressed before the network resolves", async () => {
        // FB-INT-018: Verify optimistic update precedes server response.
        let resolveServer: () => void = () => {};
        server.use(
            http.post("/api/feedback", async () => {
                await new Promise<void>((res) => {
                    resolveServer = res;
                });
                return HttpResponse.json({});
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await screen.findByText(/UrbanStyle/);
        const dislike = screen.getAllByRole("button", { name: /product is not relevant/i })[0];
        const user = userEvent.setup();
        await user.click(dislike);
        // Optimistic: aria-pressed should already be true even though the server has not responded.
        expect(dislike.getAttribute("aria-pressed")).toBe("true");

        // Now allow the server to resolve so the test cleanly tears down.
        resolveServer();
        await new Promise((r) => setTimeout(r, 20));
    });
});

// ============================================================
// FB-INT-019
// ============================================================
describe("FB-INT-019", () => {
    it("FB-INT-019 — failed feedback (500) reverts the optimistic vote", async () => {
        // FB-INT-019: Verify HTTP 500 reverts optimistic state and alerts the user.
        server.use(http.post("/api/feedback", async () => new HttpResponse(null, { status: 500 })));
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });
        await screen.findByText(/UrbanStyle/);

        const like = screen.getAllByRole("button", { name: /product is relevant/i })[0];
        const user = userEvent.setup();
        await user.click(like);

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("Failed to submit vote"));
        expect(like.getAttribute("aria-pressed")).toBe("false");
    });
});

// ============================================================
// FB-INT-020
// ============================================================
describe("FB-INT-020", () => {
    it("FB-INT-020 — clicking same vote twice clears it and fires only one feedback request", async () => {
        // FB-INT-020: Verify second click clears the vote and does not re-fire feedback.
        let count = 0;
        server.use(
            http.post("/api/feedback", async () => {
                count += 1;
                return HttpResponse.json({});
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });
        await screen.findByText(/UrbanStyle/);

        const like = screen.getAllByRole("button", { name: /product is relevant/i })[0];
        const user = userEvent.setup();
        await user.click(like);
        await waitFor(() => expect(count).toBe(1));

        await user.click(like);
        // Give it a tick for any erroneous extra request
        await new Promise((r) => setTimeout(r, 30));
        expect(count).toBe(1);
        expect(like.getAttribute("aria-pressed")).toBe("false");
    });
});

// ============================================================
// FB-INT-021
// ============================================================
describe("FB-INT-021", () => {
    it("FB-INT-021 — score badge text rounds product.score to a percentage", async () => {
        // FB-INT-021: Verify score=0.926 renders as "Score: 93%".
        const customProducts = mockProducts.map((p, i) => (i === 0 ? { ...p, score: 0.926 } : p));
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: customProducts,
                    corrected_text: "x",
                    raw_text: "x",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/score-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await waitFor(() => {
            expect(screen.getByText(/Score: 93%/)).toBeInTheDocument();
        });
    });
});

// ============================================================
// FB-INT-022
// ============================================================
describe("FB-INT-022", () => {
    it("FB-INT-022 — products without score do not render a score badge", async () => {
        // FB-INT-022: Verify absence of score yields no badge.
        const noScoreProducts = mockProducts.map((p) => {
            const copy: Record<string, unknown> = { ...p };
            delete copy.score;
            delete copy.text_score;
            delete copy.image_score;
            delete copy.combined_score;
            return copy;
        });
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: noScoreProducts,
                    corrected_text: "x",
                    raw_text: "x",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/no-score"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });

        await screen.findByText(/UrbanStyle/);
        expect(screen.queryByText(/Score:/)).toBeNull();
    });
});

// ============================================================
// FB-INT-023
// ============================================================
describe("FB-INT-023", () => {
    it("FB-INT-023 — analytics call fires once with expected fields after a successful submit", async () => {
        // FB-INT-023: Verify POST /api/analytics/search-duration carries expected keys.
        let captured: { search_id?: unknown; search_duration?: unknown; product_load_duration?: unknown } | null = null;
        let analyticsCount = 0;
        server.use(
            http.post("/api/search", async () => HttpResponse.json({ search_id: "search-abc" })),
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: mockProducts,
                    corrected_text: "x",
                    raw_text: "x",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
            http.post("/api/analytics/search-duration", async ({ request }) => {
                analyticsCount += 1;
                captured = (await request.json()) as typeof captured;
                return HttpResponse.json({ success: true });
            }),
        );

        sessionStorage.clear();
        renderWithProviders(<></>, {
            initialEntries: ["/"],
            routes: (
                <>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search/:searchId" element={<SearchPage />} />
                </>
            ),
        });
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox"), "phone case");
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        // Wait for results then for analytics call to fire
        await screen.findByText(/UrbanStyle/);
        await waitFor(() => expect(analyticsCount).toBe(1));

        expect(captured).not.toBeNull();
        expect(typeof captured!.search_id).toBe("string");
        expect(typeof captured!.search_duration).toBe("number");
        expect(typeof captured!.product_load_duration).toBe("number");
        expect(captured!.search_duration as number).toBeGreaterThan(0);
        expect(captured!.product_load_duration as number).toBeGreaterThanOrEqual(0);
    });
});

// ============================================================
// FB-INT-024
// ============================================================
describe("FB-INT-024", () => {
    it("FB-INT-024 — analytics is suppressed when sessionStorage already recorded the search", async () => {
        // FB-INT-024: Verify pre-recorded marker disables the analytics call.
        let count = 0;
        server.use(
            http.post("/api/analytics/search-duration", async () => {
                count += 1;
                return HttpResponse.json({ success: true });
            }),
        );

        sessionStorage.setItem("recorded_search_search-abc", "true");

        // Use a small wrapper that supplies a non-empty location.state.
        function Wrapper() {
            return <SearchPage />;
        }
        renderWithProviders(<></>, {
            initialEntries: [
                {
                    pathname: "/search/search-abc",
                    state: { searchDuration: 1234 },
                } as unknown as string,
            ],
            routes: <Route path="/search/:searchId" element={<Wrapper />} />,
        });

        await screen.findByText(/UrbanStyle/);
        // Allow effects to run.
        await new Promise((r) => setTimeout(r, 50));
        expect(count).toBe(0);
    });
});

// ============================================================
// FB-INT-025
// ============================================================
describe("FB-INT-025", () => {
    it("FB-INT-025 — POST /api/search 500 surfaces inline error and does not navigate", async () => {
        // FB-INT-025: Verify HTTP 500 from search shows error in SearchBar without navigation.
        server.use(http.post("/api/search", async () => new HttpResponse(null, { status: 500 })));

        renderHomeWithRoutes();
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox"), "phone case");
        await user.click(screen.getByRole("button", { name: /submit search/i }));

        const err = await screen.findByRole("alert");
        expect(err.id).toBe("search-error");
        expect(err.textContent).toMatch(/Failed to submit search request/);
        // Did not navigate
        expect(screen.queryByTestId("destination")).toBeNull();
    });
});

// ============================================================
// FB-INT-026
// ============================================================
describe("FB-INT-026", () => {
    it("FB-INT-026 — > 300 character query disables the submit button", async () => {
        // FB-INT-026: Verify char limit (300) disables submit and shows count in red.
        renderHomeWithRoutes();
        const user = userEvent.setup();
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        const longText = "a".repeat(301);
        // userEvent.type is too slow for 301 chars; use fireEvent-like direct paste through clipboard
        await act(async () => {
            await user.click(textarea);
        });
        // Use fireEvent change directly via setting value + dispatching event isn't ideal;
        // instead use user.paste which is much faster.
        textarea.focus();
        await user.paste(longText);

        expect(textarea.value.length).toBe(301);
        const submit = screen.getByRole("button", { name: /submit search/i });
        expect(submit).toBeDisabled();
        const count = screen.getByText(/301\/300/);
        expect(count).toBeInTheDocument();
        expect(count.className).toMatch(/text-red-500/);
    });
});

// ============================================================
// FB-INT-027
// ============================================================
describe("FB-INT-027", () => {
    it("FB-INT-027 — minimal Product (missing optionals) renders without console.error", async () => {
        // FB-INT-027: Verify no runtime error when score/rank/query_image absent.
        const minimalProduct = {
            product_id: "min-1",
            name: "Minimal Item",
            brand: { brand_id: 999, name: "MinBrand" },
            price: 12.34,
            description: "tiny",
            is_relevant: null,
            images: [],
            categories: [],
            subcategory: "",
        };
        server.use(
            http.get("/api/search/:searchId", async ({ params }) =>
                HttpResponse.json({
                    products: [minimalProduct],
                    corrected_text: "x",
                    raw_text: "x",
                    search_id: params.searchId,
                    fusion_type: "late_fusion",
                    textual_model_name: "BAAI/bge-large-en-v1.5",
                    visual_model_name: "ViT-B/32",
                    search_mode: "std",
                    correction_enabled: true,
                }),
            ),
        );
        const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        renderWithProviders(<></>, {
            initialEntries: ["/search/min-1"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });
        await screen.findByText(/MinBrand/);
        expect(screen.queryByText(/Score:/)).toBeNull();
        // No image preview img inside the search bar form
        const searchForm = screen.getByRole("search");
        expect(within(searchForm).queryByRole("img")).toBeNull();
        expect(errSpy).not.toHaveBeenCalled();
    });
});

// ============================================================
// FB-INT-028
// ============================================================
describe("FB-INT-028", () => {
    it("FB-INT-028 — db-fallback request uses application/json with the search id body", async () => {
        // FB-INT-028: Verify POST /api/search/db-fallback content type and JSON body.
        let contentType: string | null = null;
        let body: unknown = null;
        server.use(
            http.post("/api/search/db-fallback", async ({ request }) => {
                contentType = request.headers.get("content-type");
                body = await request.json();
                return HttpResponse.json({
                    original_search_id: 2,
                    search_text: "x",
                    products: [
                        {
                            product_id: 11,
                            name: "A",
                            price: 1,
                            score: 1.0,
                            brand: { brand_id: 1, name: "BrandA" },
                            images: [],
                            is_relevant: null,
                        },
                        {
                            product_id: 12,
                            name: "B",
                            price: 2,
                            score: 0.9,
                            brand: { brand_id: 2, name: "BrandB" },
                            images: [],
                            is_relevant: null,
                        },
                        {
                            product_id: 13,
                            name: "C",
                            price: 3,
                            score: 0.8,
                            brand: { brand_id: 3, name: "BrandC" },
                            images: [],
                            is_relevant: null,
                        },
                    ],
                });
            }),
        );

        renderWithProviders(<></>, {
            initialEntries: ["/search/search-2"],
            routes: <Route path="/search/:searchId" element={<SearchPage />} />,
        });
        await screen.findByText(/UrbanStyle/);

        const user = userEvent.setup();
        const semanticSwitch = document.getElementById("semantic-search") as HTMLInputElement;
        await user.click(semanticSwitch);

        await waitFor(() => {
            expect(screen.getByText(/BrandA/)).toBeInTheDocument();
            expect(screen.getByText(/BrandB/)).toBeInTheDocument();
            expect(screen.getByText(/BrandC/)).toBeInTheDocument();
        });
        expect(contentType).toMatch(/application\/json/);
        expect(body).toEqual({ search_id: "search-2" });
    });
});
