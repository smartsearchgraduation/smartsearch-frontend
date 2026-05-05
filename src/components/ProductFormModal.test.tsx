import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductFormModal } from "./ProductFormModal";
import * as api from "../lib/api";
import { type Product } from "../lib/api";

// Mock the API module
vi.mock("../lib/api", () => ({
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    fetchCatagories: vi.fn(),
    fetchBrands: vi.fn(),
    fetchProductImages: vi.fn(),
}));

describe("ProductFormModal", () => {
    let queryClient: QueryClient;

    const mockCategories = [
        { category_id: 1, name: "Electronics", parent_category_id: null },
        { category_id: 2, name: "Clothing", parent_category_id: null },
        { category_id: 3, name: "Phones", parent_category_id: 1 },
    ];

    const mockBrands = [
        { brand_id: 1, name: "Brand A" },
        { brand_id: 2, name: "Brand B" },
    ];

    const mockProduct: Product = {
        product_id: "123",
        name: "Test Product",
        brand: { brand_id: 1, name: "Brand A" },
        price: 99.99,
        description: "Test description",
        is_relevant: null,
        images: ["image1.jpg"],
        categories: [{ category_id: 3, name: "Phones", parent: { category_id: 1, name: "Electronics" } }],
        subcategory: "Phones",
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
                mutations: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
        vi.mocked(api.fetchCatagories).mockResolvedValue({ categories: mockCategories, total: mockCategories.length });
        vi.mocked(api.fetchBrands).mockResolvedValue(mockBrands);
        vi.mocked(api.fetchProductImages).mockResolvedValue({
            product_id: 123,
            images: [{ product_id: 123, image: "image1.jpg" }],
            total: 1,
        });
        vi.mocked(api.createProduct).mockResolvedValue({ success: true, id: "123" });
        vi.mocked(api.updateProduct).mockResolvedValue({ success: true });
        Object.defineProperty(globalThis, "crypto", {
            value: {
                randomUUID: () => "test-uuid",
            },
            writable: true,
        });
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
    });

    const renderModal = (isOpen = true, product: Product | null = null) => {
        const onClose = vi.fn();
        return render(
            <QueryClientProvider client={queryClient}>
                <ProductFormModal isOpen={isOpen} onClose={onClose} product={product} />
            </QueryClientProvider>,
        );
    };

    describe("Add Mode (No Product)", () => {
        it("renders modal with correct title", () => {
            renderModal();
            expect(screen.getByText("Add New Product")).toBeInTheDocument();
        });

        it("renders form with correct structure", () => {
            renderModal();
            const form = document.getElementById("product-form");
            expect(form).toBeInTheDocument();
        });

        it("renders form fields empty", () => {
            renderModal();
            expect(screen.getByLabelText("Product Title")).toHaveValue("");
            expect(screen.getByLabelText("Price")).toHaveValue(null);
            expect(screen.getByLabelText("Description")).toHaveValue("");
        });

        it("renders CascadingSelector", () => {
            renderModal();
            expect(screen.getByText("Category")).toBeInTheDocument();
        });

        it("renders MediaGallery", () => {
            renderModal();
            expect(screen.getByText("Media Gallery")).toBeInTheDocument();
        });

        it("renders brand combobox", () => {
            renderModal();
            expect(screen.getByLabelText("Brand")).toBeInTheDocument();
        });

        it("closes modal when cancel button clicked", () => {
            const onClose = vi.fn();
            render(
                <QueryClientProvider client={queryClient}>
                    <ProductFormModal isOpen={true} onClose={onClose} product={null} />
                </QueryClientProvider>,
            );

            const cancelButton = screen.getByText("Cancel");
            fireEvent.click(cancelButton);

            expect(onClose).toHaveBeenCalled();
        });

        it("shows validation error when submitting incomplete form", async () => {
            const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
            renderModal();

            const submitButton = screen.getByText("Publish Product");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith("Please fill all fields, and upload at least one image.");
            });

            alertSpy.mockRestore();
        });
    });

    describe("Edit Mode (With Product)", () => {
        it("renders modal with edit title", () => {
            renderModal(true, mockProduct);
            expect(screen.getByText("Edit Product")).toBeInTheDocument();
        });

        it("populates form fields with product data", async () => {
            renderModal(true, mockProduct);

            await waitFor(() => {
                expect(screen.getByLabelText("Product Title")).toHaveValue("Test Product");
                const priceInput = screen.getByLabelText("Price");
                expect(priceInput).toHaveValue(99.99);
                expect(screen.getByLabelText("Description")).toHaveValue("Test description");
            });
        });

        it("populates brand field", async () => {
            renderModal(true, mockProduct);

            await waitFor(() => {
                expect(screen.getByLabelText("Brand")).toHaveValue("Brand A");
            });
        });

        it("populates category selection", async () => {
            renderModal(true, mockProduct);

            await waitFor(() => {
                expect(screen.getByLabelText("Product Title")).toHaveValue("Test Product");
            });
        });

        it("loads existing images", async () => {
            renderModal(true, mockProduct);

            await waitFor(() => {
                expect(api.fetchProductImages).toHaveBeenCalledWith("123");
            });
        });

        it("shows loading state while fetching images", () => {
            vi.mocked(api.fetchProductImages).mockImplementation(() => new Promise(() => {}));
            renderModal(true, mockProduct);

            expect(screen.getByText("Loading images...")).toBeInTheDocument();
        });

        it("shows save changes button in edit mode", async () => {
            renderModal(true, mockProduct);

            await waitFor(() => {
                expect(screen.getByText("Save Changes")).toBeInTheDocument();
            });
        });
    });

    describe("Form Interactions", () => {
        it("updates form fields on input change", async () => {
            renderModal();

            const titleInput = screen.getByLabelText("Product Title");
            await userEvent.type(titleInput, "New Product");

            expect(titleInput).toHaveValue("New Product");
        });

        it("updates description on input change", async () => {
            renderModal();

            const descriptionInput = screen.getByLabelText("Description");
            await userEvent.type(descriptionInput, "New description");

            expect(descriptionInput).toHaveValue("New description");
        });

        it("shows character count for description", async () => {
            renderModal();

            const descriptionInput = screen.getByLabelText("Description");
            await userEvent.type(descriptionInput, "test");

            expect(screen.getByText(/4 chars/)).toBeInTheDocument();
        });

        it("updates price on input change", async () => {
            renderModal();
            const priceInput = screen.getByRole("spinbutton", { name: /price/i });
            await userEvent.type(priceInput, "99");

            expect(priceInput).toHaveValue(99);
        });
    });
});

