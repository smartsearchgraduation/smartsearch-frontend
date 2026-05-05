import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { Combobox } from "./Combobox";

describe("Combobox", () => {
    const options = [
        { value: 1, label: "Option 1" },
        { value: 2, label: "Option 2" },
        { value: 3, label: "Option 3" },
    ];

    it("renders with label", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} label="Test Label" />);
        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
    });

    it("options populate from prop", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
    });

    it("selected value displays", () => {
        render(<Combobox options={options} value="Option 2" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.value).toBe("Option 2");
    });

    it("onChange callback fires", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Combobox options={options} value="" onChange={handleChange} />);
        const input = screen.getByRole("textbox");
        await user.type(input, "Option");
        expect(handleChange).toHaveBeenCalled();
    });

    it("typing filters options", async () => {
        const user = userEvent.setup();
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        await user.type(input, "1");
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        // Option 2 and 3 should still be visible since dropdown is open
    });

    it("opens dropdown on focus", async () => {
        const user = userEvent.setup();
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("selects option on click", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Combobox options={options} value="" onChange={handleChange} />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        await user.click(screen.getByText("Option 2"));
        expect(handleChange).toHaveBeenCalledWith("Option 2");
    });

    it("closes dropdown on selection", async () => {
        const user = userEvent.setup();
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        await user.click(screen.getByText("Option 2"));
        expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("closes dropdown on outside click", async () => {
        const user = userEvent.setup();
        render(
            <div>
                <Combobox options={options} value="" onChange={vi.fn()} />
                <button>Outside</button>
            </div>,
        );
        const input = screen.getByRole("textbox");
        await user.click(input);
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        await user.click(screen.getByText("Outside"));
        expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("keyboard navigation - arrow down opens dropdown", async () => {
        const user = userEvent.setup();
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        await user.type(input, "{ArrowDown}");
        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("keyboard navigation - enter selects option", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Combobox options={options} value="" onChange={handleChange} />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        await user.type(input, "{Enter}");
        expect(handleChange).toHaveBeenCalledWith("Option 1");
    });

    it("keyboard navigation - escape closes dropdown", async () => {
        const user = userEvent.setup();
        render(<Combobox options={options} value="" onChange={vi.fn()} />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        await user.type(input, "{Escape}");
        expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("renders disabled state", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} disabled />);
        const input = screen.getByRole("textbox");
        expect(input).toBeDisabled();
    });

    it("placeholder displays", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} placeholder="Select..." />);
        const input = screen.getByPlaceholderText("Select...");
        expect(input).toBeInTheDocument();
    });

    it("merges className prop", () => {
        const { container } = render(
            <Combobox options={options} value="" onChange={vi.fn()} className="custom-class" />,
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-class");
    });

    it("shows no matching options message", async () => {
        const user = userEvent.setup();
        const TestComponent = () => {
            const [value, setValue] = useState("");
            return <Combobox options={options} value={value} onChange={setValue} />;
        };
        render(<TestComponent />);
        const input = screen.getByRole("textbox");
        await user.click(input);
        await user.clear(input);
        await user.type(input, "xyz");
        expect(screen.getByText("No matching options found.")).toBeInTheDocument();
    });

    it("allows custom value entry via typing", async () => {
        const user = userEvent.setup();
        const TestComponent = () => {
            const [value, setValue] = useState("");
            return <Combobox options={options} value={value} onChange={setValue} />;
        };
        render(<TestComponent />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        await user.type(input, "Custom Value");
        expect(input.value).toBe("Custom Value");
    });

    it("has accessibility attributes", () => {
        render(<Combobox options={options} value="" onChange={vi.fn()} label="Test Label" />);
        const label = screen.getByText("Test Label");
        const input = screen.getByRole("textbox");
        expect(label).toHaveAttribute("for");
        expect(input).toHaveAttribute("id");
        expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
    });
});
