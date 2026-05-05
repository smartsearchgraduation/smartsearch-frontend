import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CascadingSelector } from "./CascadingSelector";
import { type Category } from "../lib/api";

describe("CascadingSelector", () => {
    const mockCategories: Category[] = [
        { category_id: 1, name: "Electronics", parent_category_id: null },
        { category_id: 2, name: "Clothing", parent_category_id: null },
        { category_id: 3, name: "Phones", parent_category_id: 1 },
        { category_id: 4, name: "Laptops", parent_category_id: 1 },
        { category_id: 5, name: "Shirts", parent_category_id: 2 },
        { category_id: 6, name: "Pants", parent_category_id: 2 },
    ];

    const mockOnCategorySelect = vi.fn();
    const mockOnSubcategorySelect = vi.fn();

    beforeEach(() => {
        mockOnCategorySelect.mockClear();
        mockOnSubcategorySelect.mockClear();
    });

    const renderSelector = (selectedCategoryId: number | null = null, selectedSubcategoryId: number | null = null) => {
        return render(
            <CascadingSelector
                selectedCategoryId={selectedCategoryId}
                selectedSubcategoryId={selectedSubcategoryId}
                onCategorySelect={mockOnCategorySelect}
                onSubcategorySelect={mockOnSubcategorySelect}
                categories={mockCategories}
            />,
        );
    };

    describe("Parent Categories", () => {
        it("renders parent categories", () => {
            renderSelector();
            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });

        it("filters to show only parent categories (no parent)", () => {
            renderSelector();
            // Should not show subcategories in parent list
            expect(screen.queryByText("Phones")).not.toBeInTheDocument();
            expect(screen.queryByText("Laptops")).not.toBeInTheDocument();
        });

        it("highlights selected parent category", () => {
            renderSelector(1);
            const electronicsLabel = screen.getByText("Electronics").closest("label");
            expect(electronicsLabel).toHaveClass("bg-emerald-100", "text-emerald-900", "ring-2", "ring-emerald-600");
        });

        it("does not highlight unselected parent category", () => {
            renderSelector(1);
            const clothingLabel = screen.getByText("Clothing").closest("label");
            expect(clothingLabel).not.toHaveClass("bg-emerald-100", "ring-emerald-600");
        });

        it("calls onCategorySelect when parent category clicked", () => {
            renderSelector();
            const electronicsRadio = screen.getByLabelText("Electronics");
            fireEvent.click(electronicsRadio);
            expect(mockOnCategorySelect).toHaveBeenCalledWith(1);
        });

        it("shows arrow indicator for selected parent category", () => {
            renderSelector(1);
            const electronicsLabel = screen.getByText("Electronics").closest("label");
            expect(electronicsLabel?.querySelector("svg")).toBeInTheDocument();
        });
    });

    describe("Sub Categories", () => {
        it("shows empty state when no parent selected", () => {
            renderSelector();
            expect(screen.getByText("Select a primary category")).toBeInTheDocument();
        });

        it("renders subcategories when parent selected", () => {
            renderSelector(1);
            expect(screen.getByText("Phones")).toBeInTheDocument();
            expect(screen.getByText("Laptops")).toBeInTheDocument();
        });

        it("filters subcategories by parent category", () => {
            renderSelector(1);
            expect(screen.getByText("Phones")).toBeInTheDocument();
            expect(screen.queryByText("Shirts")).not.toBeInTheDocument();
        });

        it("highlights selected subcategory", () => {
            renderSelector(1, 3);
            const phonesLabel = screen.getByLabelText("Phones").closest("label");
            expect(phonesLabel).toHaveClass("bg-white", "shadow-md", "ring-2", "ring-emerald-600");
        });

        it("calls onSubcategorySelect when subcategory clicked", () => {
            renderSelector(1);
            const phonesRadio = screen.getByLabelText("Phones");
            fireEvent.click(phonesRadio);
            expect(mockOnSubcategorySelect).toHaveBeenCalledWith(3);
        });
    });

    describe("Selection Behavior", () => {
        it("updates subcategory options when parent category changes", () => {
            const { rerender } = renderSelector(1, 3);
            expect(screen.getAllByText("Phones")).toHaveLength(2);

            rerender(
                <CascadingSelector
                    selectedCategoryId={2}
                    selectedSubcategoryId={null}
                    onCategorySelect={mockOnCategorySelect}
                    onSubcategorySelect={mockOnSubcategorySelect}
                    categories={mockCategories}
                />,
            );

            // Should show clothing subcategories
            expect(screen.getByText("Shirts")).toBeInTheDocument();
            expect(screen.queryByLabelText("Phones")).not.toBeInTheDocument();
        });

        it("shows subcategories for new parent after selection change", () => {
            const { rerender } = renderSelector(1);
            expect(screen.getByText("Phones")).toBeInTheDocument();

            rerender(
                <CascadingSelector
                    selectedCategoryId={2}
                    selectedSubcategoryId={null}
                    onCategorySelect={mockOnCategorySelect}
                    onSubcategorySelect={mockOnSubcategorySelect}
                    categories={mockCategories}
                />,
            );

            expect(screen.getByText("Shirts")).toBeInTheDocument();
            expect(screen.getByText("Pants")).toBeInTheDocument();
        });
    });

    describe("Summary Footer", () => {
        it("shows incomplete selection message when nothing selected", () => {
            renderSelector();
            expect(screen.getByText("Incomplete selection")).toBeInTheDocument();
        });

        it("shows incomplete selection when only parent selected", () => {
            renderSelector(1);
            expect(screen.getByText("Incomplete selection")).toBeInTheDocument();
        });

        it("shows complete selection when both parent and subcategory selected", () => {
            renderSelector(1, 3);
            expect(screen.getAllByText("Electronics")).toHaveLength(2);
            expect(screen.getAllByText("Phones")).toHaveLength(2);
            expect(screen.queryByText("Incomplete selection")).not.toBeInTheDocument();
        });

        it("displays parent and subcategory names in footer", () => {
            renderSelector(1, 3);
            const electronicsSpans = screen.getAllByText("Electronics");
            const footerSpan = electronicsSpans.find((span) => span.classList.contains("bg-gray-200"));
            expect(footerSpan).toBeInTheDocument();
            expect(footerSpan).toHaveTextContent("Electronics");
            expect(screen.getByText("Phones", { selector: ".bg-emerald-200" })).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("uses radio inputs for parent categories", () => {
            renderSelector();
            const electronicsRadio = screen.getByLabelText("Electronics");
            expect(electronicsRadio).toHaveAttribute("type", "radio");
        });

        it("uses radio inputs for subcategories", () => {
            renderSelector(1);
            const phonesRadio = screen.getByLabelText("Phones");
            expect(phonesRadio).toHaveAttribute("type", "radio");
        });

        it("sets checked attribute for selected parent", () => {
            renderSelector(1);
            const electronicsRadio = screen.getByLabelText("Electronics");
            expect(electronicsRadio).toBeChecked();
        });

        it("sets checked attribute for selected subcategory", () => {
            renderSelector(1, 3);
            const phonesRadio = screen.getByLabelText("Phones");
            expect(phonesRadio).toBeChecked();
        });

        it("uses fieldset for parent categories", () => {
            renderSelector();
            const primaryTexts = screen.getAllByText("Primary Category");
            const fieldset = primaryTexts[0].closest("fieldset");
            expect(fieldset).toBeInTheDocument();
        });

        it("uses fieldset for subcategories", () => {
            renderSelector();
            const subcategoryTexts = screen.getAllByText("Sub Category");
            const fieldset = subcategoryTexts[1].closest("fieldset");
            expect(fieldset).toBeInTheDocument();
        });
    });

    describe("Layout and Styling", () => {
        it("renders Card component wrapper", () => {
            const { container } = renderSelector();
            const card = container.querySelector('[class*="bg-gray-200"]');
            expect(card).toBeInTheDocument();
        });
    });
});

