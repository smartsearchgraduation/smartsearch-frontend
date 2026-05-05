import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";
import * as api from "../lib/api";
import { type Product } from "../lib/api";

// Mock the API module
vi.mock("../lib/api", () => ({
    productFeedback: vi.fn(),
}));

describe("ProductCard", () => {
    let queryClient: QueryClient;

    const mockProduct: Product = {
        product_id: "123",
        name: "Brand Product Name",
        brand: { brand_id: 1, name: "Brand" },
        price: 99.99,
        description: "Test description",
        is_relevant: null,
        images: ["image1.jpg", "image2.jpg"],
        categories: [],
        subcategory: "test",
        score: 0.85,
        text_score: 0.8,
        image_score: 0.9,
        rank: 1,
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                mutations: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    const renderProductCard = (product = mockProduct, searchId = "search-123") => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ProductCard searchId={searchId} product={product} />
                </MemoryRouter>
            </QueryClientProvider>,
        );
    };

    describe("Product Data Rendering", () => {
        it("renders product brand and name", () => {
            renderProductCard();
            expect(screen.getByText("Brand")).toBeInTheDocument();
            expect(screen.getByText(/Product Name/)).toBeInTheDocument();
        });

        it("renders price correctly", () => {
            renderProductCard();
            expect(screen.getByText("$99.99")).toBeInTheDocument();
        });

        it("links to product page", () => {
            renderProductCard();
            const links = screen.getAllByRole("link");
            const productLink = links.find(
                (link) => link.getAttribute("href") === `/product/${mockProduct.product_id}`,
            );
            expect(productLink).toBeInTheDocument();
        });

        it("renders without score when score is undefined", () => {
            const productWithoutScore: Product = { ...mockProduct, score: undefined };
            renderProductCard(productWithoutScore);
            expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
        });
    });

    describe("Score Badge and Tooltip", () => {
        it("displays score badge when score exists", () => {
            renderProductCard();
            expect(screen.getByText(/Score: 85%/)).toBeInTheDocument();
        });

        it("shows tooltip with score breakdown on hover", async () => {
            renderProductCard();
            const scoreBadge = screen.getByText(/Score: 85%/);
            fireEvent.mouseEnter(scoreBadge);

            await waitFor(() => {
                expect(screen.getByText(/Score: 85.0%/)).toBeInTheDocument();
                expect(screen.getByText(/Text: 80.0%/)).toBeInTheDocument();
                expect(screen.getByText(/Image: 90.0%/)).toBeInTheDocument();
                expect(screen.getByText(/Rank: #1/)).toBeInTheDocument();
            });
        });

        it("displays only text_score when available", () => {
            const productWithTextOnly: Product = { ...mockProduct, image_score: undefined, rank: undefined };
            renderProductCard(productWithTextOnly);
            const scoreBadge = screen.getByText(/Score: 85%/);
            fireEvent.mouseEnter(scoreBadge);

            expect(screen.getByText(/Text: 80.0%/)).toBeInTheDocument();
            expect(screen.queryByText(/Image:/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Rank:/)).not.toBeInTheDocument();
        });

        it("displays only image_score when available", () => {
            const productWithImageOnly: Product = { ...mockProduct, text_score: undefined, rank: undefined };
            renderProductCard(productWithImageOnly);
            const scoreBadge = screen.getByText(/Score: 85%/);
            fireEvent.mouseEnter(scoreBadge);

            expect(screen.getByText(/Image: 90.0%/)).toBeInTheDocument();
            expect(screen.queryByText(/Text:/)).not.toBeInTheDocument();
        });
    });

    describe("Voting Functionality", () => {
        it("renders like and dislike buttons", () => {
            renderProductCard();
            expect(screen.getByLabelText("Product is relevant")).toBeInTheDocument();
            expect(screen.getByLabelText("Product is not relevant")).toBeInTheDocument();
        });

        it("submits like feedback when like button clicked", async () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const likeButton = screen.getByLabelText("Product is relevant");
            fireEvent.click(likeButton);

            await waitFor(() => {
                expect(api.productFeedback).toHaveBeenCalledWith("search-123", "123", "like");
            });
        });

        it("submits dislike feedback when dislike button clicked", async () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const dislikeButton = screen.getByLabelText("Product is not relevant");
            fireEvent.click(dislikeButton);

            await waitFor(() => {
                expect(api.productFeedback).toHaveBeenCalledWith("search-123", "123", "dislike");
            });
        });

        it("optimistically updates vote state on like", () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const likeButton = screen.getByLabelText("Product is relevant");
            expect(likeButton).toHaveAttribute("aria-pressed", "false");

            fireEvent.click(likeButton);

            expect(likeButton).toHaveAttribute("aria-pressed", "true");
        });

        it("optimistically updates vote state on dislike", () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const dislikeButton = screen.getByLabelText("Product is not relevant");
            expect(dislikeButton).toHaveAttribute("aria-pressed", "false");

            fireEvent.click(dislikeButton);

            expect(dislikeButton).toHaveAttribute("aria-pressed", "true");
        });

        it("toggles vote off when clicking same button again", async () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const likeButton = screen.getByLabelText("Product is relevant");

            fireEvent.click(likeButton);
            expect(likeButton).toHaveAttribute("aria-pressed", "true");

            fireEvent.click(likeButton);
            expect(likeButton).toHaveAttribute("aria-pressed", "false");

            await waitFor(() => {
                expect(api.productFeedback).toHaveBeenCalledTimes(1); // Only called on first click
            });
        });

        it("switches from like to dislike when clicking dislike after like", async () => {
            vi.mocked(api.productFeedback).mockResolvedValue(undefined);
            renderProductCard();

            const likeButton = screen.getByLabelText("Product is relevant");
            const dislikeButton = screen.getByLabelText("Product is not relevant");

            fireEvent.click(likeButton);
            expect(likeButton).toHaveAttribute("aria-pressed", "true");
            expect(dislikeButton).toHaveAttribute("aria-pressed", "false");

            fireEvent.click(dislikeButton);
            expect(likeButton).toHaveAttribute("aria-pressed", "false");
            expect(dislikeButton).toHaveAttribute("aria-pressed", "true");

            await waitFor(() => {
                expect(api.productFeedback).toHaveBeenCalledWith("search-123", "123", "dislike");
            });
        });

        it("reflects previous vote state from product data", () => {
            const productWithLike = { ...mockProduct, is_relevant: true };
            renderProductCard(productWithLike);

            const likeButton = screen.getByLabelText("Product is relevant");
            expect(likeButton).toHaveAttribute("aria-pressed", "true");
        });

        it("reflects previous dislike state from product data", () => {
            const productWithDislike = { ...mockProduct, is_relevant: false };
            renderProductCard(productWithDislike);

            const dislikeButton = screen.getByLabelText("Product is not relevant");
            expect(dislikeButton).toHaveAttribute("aria-pressed", "true");
        });

        it("handles feedback error and resets vote state", async () => {
            const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
            vi.mocked(api.productFeedback).mockRejectedValue(new Error("API error"));

            renderProductCard();

            const likeButton = screen.getByLabelText("Product is relevant");
            fireEvent.click(likeButton);

            expect(likeButton).toHaveAttribute("aria-pressed", "true");

            await waitFor(() => {
                expect(likeButton).toHaveAttribute("aria-pressed", "false");
                expect(alertSpy).toHaveBeenCalledWith("Failed to submit vote");
            });

            alertSpy.mockRestore();
        });
    });

    describe("Accessibility", () => {
        it("has aria-pressed attribute on vote buttons", () => {
            renderProductCard();
            const likeButton = screen.getByLabelText("Product is relevant");
            const dislikeButton = screen.getByLabelText("Product is not relevant");

            expect(likeButton).toHaveAttribute("aria-pressed");
            expect(dislikeButton).toHaveAttribute("aria-pressed");
        });

        it("has aria-label on vote buttons", () => {
            renderProductCard();
            expect(screen.getByLabelText("Product is relevant")).toBeInTheDocument();
            expect(screen.getByLabelText("Product is not relevant")).toBeInTheDocument();
        });
    });
});
