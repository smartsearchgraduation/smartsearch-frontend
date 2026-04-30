import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
    it("renders with label", () => {
        render(<Input label="Test Label" />);
        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
        render(<Input />);
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("value changes on input", async () => {
        const user = userEvent.setup();
        render(<Input />);
        const input = screen.getByRole("textbox");
        await user.type(input, "test value");
        expect(input).toHaveValue("test value");
    });

    it("calls onChange callback", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);
        const input = screen.getByRole("textbox");
        await user.type(input, "a");
        expect(handleChange).toHaveBeenCalled();
    });

    it("renders disabled state", () => {
        render(<Input disabled />);
        const input = screen.getByRole("textbox");
        expect(input).toBeDisabled();
    });

    it("renders with left icon", () => {
        render(<Input leftIcon={<span data-testid="left-icon">Icon</span>} />);
        expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders with type attribute", () => {
        render(<Input type="number" />);
        const input = screen.getByRole("spinbutton");
        expect(input).toBeInTheDocument();
    });

    it("renders with name attribute", () => {
        render(<Input name="test-field" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("name", "test-field");
    });

    it("merges wrapper className", () => {
        const { container } = render(<Input wrapperClassName="custom-wrapper" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("merges input className", () => {
        const { container } = render(<Input className="custom-input" />);
        const input = container.querySelector("input");
        expect(input).toHaveClass("custom-input");
    });

    it("associates label with input using htmlFor", () => {
        render(<Input label="Test Label" />);
        const label = screen.getByText("Test Label");
        const input = screen.getByRole("textbox");
        expect(label).toHaveAttribute("for");
        expect(input).toHaveAttribute("id");
        expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
    });

    it("uses provided id instead of generated", () => {
        render(<Input id="custom-id" label="Test Label" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("id", "custom-id");
    });
});
