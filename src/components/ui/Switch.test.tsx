import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
    it("renders unchecked state by default", () => {
        render(<Switch />);
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
        expect(checkbox).not.toBeChecked();
    });

    it("renders checked state when checked prop is true", () => {
        render(<Switch checked={true} />);
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
        expect(checkbox).toBeChecked();
    });

    it("toggles on click", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Switch onChange={handleChange} />);
        const checkbox = screen.getByRole("checkbox");
        await user.click(checkbox);
        expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange with new value", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Switch checked={true} onChange={handleChange} />);
        const checkbox = screen.getByRole("checkbox");
        await user.click(checkbox);
        expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("renders disabled state", () => {
        render(<Switch disabled />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeDisabled();
    });

    it("does not call onChange when disabled", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Switch disabled onChange={handleChange} />);
        const checkbox = screen.getByRole("checkbox");
        await user.click(checkbox);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it("has id attribute when provided", () => {
        render(<Switch id="custom-switch" />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toHaveAttribute("id", "custom-switch");
    });

    it("has correct accessibility attributes", () => {
        render(<Switch />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("merges className prop", () => {
        const { container } = render(<Switch className="custom-class" />);
        const label = container.firstChild as HTMLElement;
        expect(label).toHaveClass("custom-class");
    });
});

