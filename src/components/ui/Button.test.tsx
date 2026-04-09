import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button component", () => {
    it("renders with default props", () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole("button", { name: "Click me" });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("bg-emerald-600");
    });

    it("renders with different variants", () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-emerald-600");

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-white");

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-transparent");

        rerender(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-red-50");
    });

    it("renders with different sizes", () => {
        const { rerender } = render(<Button size="default">Default</Button>);
        expect(screen.getByRole("button")).toHaveClass("px-6", "py-2");

        rerender(<Button size="sm">Small</Button>);
        expect(screen.getByRole("button")).toHaveClass("px-3", "py-1");

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole("button")).toHaveClass("px-8", "py-3");

        rerender(<Button size="icon">Icon</Button>);
        expect(screen.getByRole("button")).toHaveClass("w-10", "h-10");
    });

    it("handles click events", async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole("button");

        await user.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50");
    });

    it("applies custom className", () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("custom-class");
    });
});
