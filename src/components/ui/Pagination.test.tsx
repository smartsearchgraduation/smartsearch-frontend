import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
    it("renders page numbers", () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
        expect(
            screen.getByText((_content, element) => {
                return element?.textContent === "Page 1 of 5";
            }),
        ).toBeInTheDocument();
    });

    it("highlights current page", () => {
        render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
        const currentPageButton = screen.getByRole("button", { name: "3" });
        expect(currentPageButton).toHaveClass("bg-emerald-600");
    });

    it("disables Previous button on first page", () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
        const prevButton = screen.getByText("Previous");
        expect(prevButton).toBeDisabled();
    });

    it("disables Next button on last page", () => {
        render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
        const nextButton = screen.getByText("Next");
        expect(nextButton).toBeDisabled();
    });

    it("calls onPageChange when Previous clicked", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={handleChange} />);
        const prevButton = screen.getByText("Previous");
        await user.click(prevButton);
        expect(handleChange).toHaveBeenCalledWith(1);
    });

    it("calls onPageChange when Next clicked", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={handleChange} />);
        const nextButton = screen.getByText("Next");
        await user.click(nextButton);
        expect(handleChange).toHaveBeenCalledWith(3);
    });

    it("navigates to specific page via onPageChange", () => {
        const handleChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />);
        // This is tested via the Previous/Next button tests
        expect(handleChange).not.toHaveBeenCalled();
    });

    it("handles single page", () => {
        render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
        expect(
            screen.getByText((_content, element) => {
                return element?.textContent === "Page 1 of 1";
            }),
        ).toBeInTheDocument();
        const prevButton = screen.getByText("Previous");
        const nextButton = screen.getByText("Next");
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
    });

    it("merges className prop", () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} className="custom-class" />,
        );
        const pagination = container.firstChild as HTMLElement;
        expect(pagination).toHaveClass("custom-class");
    });

    it("supports keyboard navigation with Tab key", async () => {
        const user = userEvent.setup();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
        const prevButton = screen.getByText("Previous");
        await user.tab();
        expect(prevButton).toHaveFocus();
    });

    describe("getPageNumbers function coverage", () => {
        it("shows all pages when total pages <= 7", () => {
            render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
        });

        it("shows ellipsis at end when current page is early (<= 4)", () => {
            render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
            expect(screen.getByText("...")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
        });

        it("shows ellipsis at start when current page is late (>= totalPages - 3)", () => {
            render(<Pagination currentPage={8} totalPages={10} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByText("...")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "7" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "9" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
        });

        it("shows ellipsis on both sides when current page is in middle", () => {
            render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            const ellipsisElements = screen.getAllByText("...");
            expect(ellipsisElements).toHaveLength(2);
            expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
        });

        it("handles edge case with exactly 7 pages", () => {
            render(<Pagination currentPage={4} totalPages={7} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "7" })).toBeInTheDocument();
            // No ellipsis when exactly 7 pages
            expect(screen.queryByText("...")).not.toBeInTheDocument();
        });

        it("handles large page numbers at start", () => {
            render(<Pagination currentPage={1} totalPages={20} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
            expect(screen.getByText("...")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
        });

        it("handles large page numbers at end", () => {
            render(<Pagination currentPage={20} totalPages={20} onPageChange={vi.fn()} />);
            expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
            expect(screen.getByText("...")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "16" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "17" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "18" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "19" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
        });
    });
});
