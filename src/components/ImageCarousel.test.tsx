import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ImageCarousel } from "./ImageCarousel";

describe("ImageCarousel", () => {
    const mockImages = ["image1.jpg", "image2.jpg", "image3.jpg"];

    describe("Rendering States", () => {
        it("renders empty state when no images provided", () => {
            render(<ImageCarousel images={[]} alt="Test Product" />);
            expect(screen.getByText("No image")).toBeInTheDocument();
            expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Test Product");
        });

        it("renders with single image", () => {
            render(<ImageCarousel images={["image1.jpg"]} alt="Test Product" />);
            const img = screen.getByRole("img");
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("src", "image1.jpg");
            expect(img).toHaveAttribute("alt", "Test Product - Image 1");
        });

        it("renders with multiple images", () => {
            render(<ImageCarousel images={mockImages} alt="Test Product" />);
            const img = screen.getByRole("img");
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("src", "image1.jpg");
        });

        it("applies custom className", () => {
            const { container } = render(<ImageCarousel images={mockImages} alt="Test" className="custom-class" />);
            expect(container.firstChild).toHaveClass("custom-class");
        });
    });

    describe("Navigation Buttons", () => {
        it("shows navigation buttons only with multiple images", () => {
            const { container: single } = render(<ImageCarousel images={["image1.jpg"]} alt="Test" />);
            expect(single.querySelector('[aria-label="Previous image"]')).not.toBeInTheDocument();
            expect(single.querySelector('[aria-label="Next image"]')).not.toBeInTheDocument();

            const { container: multi } = render(<ImageCarousel images={mockImages} alt="Test" />);
            expect(multi.querySelector('[aria-label="Previous image"]')).toBeInTheDocument();
            expect(multi.querySelector('[aria-label="Next image"]')).toBeInTheDocument();
        });

        it("next button advances to next image", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("src", "image1.jpg");

            const nextButton = screen.getByLabelText("Next image");
            fireEvent.click(nextButton);

            expect(img).toHaveAttribute("src", "image2.jpg");
        });

        it("previous button goes to previous image", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");

            // First advance to second image
            const nextButton = screen.getByLabelText("Next image");
            fireEvent.click(nextButton);
            expect(img).toHaveAttribute("src", "image2.jpg");

            // Then go back
            const prevButton = screen.getByLabelText("Previous image");
            fireEvent.click(prevButton);
            expect(img).toHaveAttribute("src", "image1.jpg");
        });

        it("circular navigation: last to first on next", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            const nextButton = screen.getByLabelText("Next image");

            // Navigate to last image
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);
            expect(img).toHaveAttribute("src", "image3.jpg");

            // Next should go to first
            fireEvent.click(nextButton);
            expect(img).toHaveAttribute("src", "image1.jpg");
        });

        it("circular navigation: first to last on previous", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            const prevButton = screen.getByLabelText("Previous image");

            expect(img).toHaveAttribute("src", "image1.jpg");

            // Previous should go to last
            fireEvent.click(prevButton);
            expect(img).toHaveAttribute("src", "image3.jpg");
        });
    });

    describe("Indicators", () => {
        it("displays correct number of indicators", () => {
            const { container } = render(<ImageCarousel images={mockImages} alt="Test" />);
            const indicators = container.querySelectorAll('[class*="rounded-full"][class*="shadow-sm"]');
            expect(indicators).toHaveLength(3);
        });

        it("highlights active indicator for current image", () => {
            const { container } = render(<ImageCarousel images={mockImages} alt="Test" />);
            const indicators = container.querySelectorAll('[class*="rounded-full"][class*="shadow-sm"]');
            expect(indicators[0]).toHaveClass("w-4", "bg-emerald-500");
            expect(indicators[1]).toHaveClass("w-1.5", "bg-gray-300/60");
            expect(indicators[2]).toHaveClass("w-1.5", "bg-gray-300/60");
        });

        it("updates active indicator on navigation", () => {
            const { container } = render(<ImageCarousel images={mockImages} alt="Test" />);
            const nextButton = screen.getByLabelText("Next image");

            fireEvent.click(nextButton);

            const indicators = container.querySelectorAll('[class*="rounded-full"][class*="shadow-sm"]');
            expect(indicators[0]).toHaveClass("w-1.5", "bg-gray-300/60");
            expect(indicators[1]).toHaveClass("w-4", "bg-emerald-500");
            expect(indicators[2]).toHaveClass("w-1.5", "bg-gray-300/60");
        });
    });

    describe("Link Wrapper", () => {
        it("wraps image in Link when url provided", () => {
            render(
                <MemoryRouter>
                    <ImageCarousel images={mockImages} alt="Test" url="/product/123" />
                </MemoryRouter>,
            );
            const link = screen.getByRole("link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/product/123");
        });

        it("does not wrap image when url not provided", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });
    });

    describe("Alt Text", () => {
        it("updates alt text with image index", () => {
            render(<ImageCarousel images={mockImages} alt="Test Product" />);
            const img = screen.getByRole("img");
            const nextButton = screen.getByLabelText("Next image");

            expect(img).toHaveAttribute("alt", "Test Product - Image 1");

            fireEvent.click(nextButton);
            expect(img).toHaveAttribute("alt", "Test Product - Image 2");

            fireEvent.click(nextButton);
            expect(img).toHaveAttribute("alt", "Test Product - Image 3");
        });
    });

    describe("Touch Gestures", () => {
        it("handles left swipe to go to next image", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            const carousel = img.parentElement as HTMLElement;

            // Simulate left swipe (touchStart > touchEnd by > 50px)
            fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] });
            fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 40 }] });
            fireEvent.touchEnd(carousel);

            expect(img).toHaveAttribute("src", "image2.jpg");
        });

        it("handles right swipe to go to previous image", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            const carousel = img.parentElement as HTMLElement;

            // Simulate right swipe (touchEnd > touchStart by > 50px)
            fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 50 }] });
            fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 110 }] });
            fireEvent.touchEnd(carousel);

            expect(img).toHaveAttribute("src", "image3.jpg"); // Circular: first -> last
        });

        it("ignores swipe when distance is below threshold", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            const carousel = img.parentElement as HTMLElement;

            // Small swipe (less than 50px threshold)
            fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 100 }] });
            fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 70 }] });
            fireEvent.touchEnd(carousel);

            expect(img).toHaveAttribute("src", "image1.jpg"); // Should not change
        });
    });

    describe("Accessibility", () => {
        it("has aria-label on navigation buttons", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
            expect(screen.getByLabelText("Next image")).toBeInTheDocument();
        });

        it("sets img tabIndex to -1", () => {
            render(<ImageCarousel images={mockImages} alt="Test" />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("tabIndex", "-1");
        });
    });
});

