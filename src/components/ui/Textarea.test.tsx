import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
    it("renders with label", () => {
        render(<Textarea label="Test Label" />);
        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
        render(<Textarea />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
        render(<Textarea placeholder="Enter text" />);
        expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("value changes on input", async () => {
        const user = userEvent.setup();
        render(<Textarea />);
        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "test value");
        expect(textarea).toHaveValue("test value");
    });

    it("onChange callback fires", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Textarea onChange={handleChange} />);
        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "a");
        expect(handleChange).toHaveBeenCalled();
    });

    it("renders with rows attribute", () => {
        render(<Textarea rows={5} />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("rows", "5");
    });

    it("renders disabled state", () => {
        render(<Textarea disabled />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeDisabled();
    });

    it("renders footer when provided", () => {
        render(<Textarea footer={<span>Footer content</span>} />);
        expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("renders with name attribute", () => {
        render(<Textarea name="test-field" />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("name", "test-field");
    });

    it("merges wrapper className", () => {
        const { container } = render(<Textarea wrapperClassName="custom-wrapper" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("merges textarea className", () => {
        const { container } = render(<Textarea className="custom-textarea" />);
        const textarea = container.querySelector("textarea");
        expect(textarea).toHaveClass("custom-textarea");
    });

    it("associates label with textarea using htmlFor", () => {
        render(<Textarea label="Test Label" />);
        const label = screen.getByText("Test Label");
        const textarea = screen.getByRole("textbox");
        expect(label).toHaveAttribute("for");
        expect(textarea).toHaveAttribute("id");
        expect(label.getAttribute("for")).toBe(textarea.getAttribute("id"));
    });

    it("uses provided id instead of generated", () => {
        render(<Textarea id="custom-id" label="Test Label" />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("id", "custom-id");
    });
});
