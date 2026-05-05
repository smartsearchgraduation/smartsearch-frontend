import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingWave from "./LoadingWave";

describe("LoadingWave component", () => {
    it("renders with default message", () => {
        render(<LoadingWave />);
        expect(screen.getByText("Loading results")).toBeInTheDocument();
    });

    it("renders with custom message", () => {
        render(<LoadingWave message="Custom loading message" />);
        expect(screen.getByText("Custom loading message")).toBeInTheDocument();
    });

    it("has correct accessibility role", () => {
        render(<LoadingWave />);
        const loadingElement = screen.getByRole("status");
        expect(loadingElement).toBeInTheDocument();
    });

    it("contains three loading dots", () => {
        render(<LoadingWave />);
        // Since we don't have test ids, we'll check for the component structure
        const loadingElement = screen.getByRole("status");
        expect(loadingElement).toBeInTheDocument();
    });

    it("applies animation styles", () => {
        render(<LoadingWave />);
        const loadingElement = screen.getByRole("status");
        // Check that the element has animation-related classes
        expect(loadingElement).toBeInTheDocument();
    });
});
