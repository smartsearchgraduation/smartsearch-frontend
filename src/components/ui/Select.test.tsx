import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
    const options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
    ];

    it("renders with label", () => {
        render(<Select options={options} value="" onChange={vi.fn()} label="Test Label" />);
        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
        render(<Select options={options} value="" onChange={vi.fn()} />);
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();
    });

    it("options populate from prop", () => {
        render(<Select options={options} value="" onChange={vi.fn()} />);
        const select = screen.getByRole("combobox");
        expect(select).toHaveLength(options.length);
    });

    it("selected value displays", () => {
        render(<Select options={options} value="option2" onChange={vi.fn()} />);
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("option2");
    });

    it("onChange callback fires", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Select options={options} value="" onChange={handleChange} />);
        const select = screen.getByRole("combobox");
        await user.selectOptions(select, "option2");
        expect(handleChange).toHaveBeenCalledWith("option2");
    });

    it("renders disabled state", () => {
        render(<Select options={options} value="" onChange={vi.fn()} disabled />);
        const select = screen.getByRole("combobox");
        expect(select).toBeDisabled();
    });

    it("merges wrapper className", () => {
        const { container } = render(
            <Select options={options} value="" onChange={vi.fn()} wrapperClassName="custom-wrapper" />,
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("merges select className", () => {
        const { container } = render(
            <Select options={options} value="" onChange={vi.fn()} className="custom-select" />,
        );
        const select = container.querySelector("select");
        expect(select).toHaveClass("custom-select");
    });

    it("associates label with input using htmlFor", () => {
        render(<Select options={options} value="" onChange={vi.fn()} label="Test Label" />);
        const label = screen.getByText("Test Label");
        const select = screen.getByRole("combobox");
        expect(label).toHaveAttribute("for");
        expect(select).toHaveAttribute("id");
        expect(label.getAttribute("for")).toBe(select.getAttribute("id"));
    });

    it("uses provided id instead of generated", () => {
        render(<Select options={options} value="" onChange={vi.fn()} id="custom-id" label="Test Label" />);
        const select = screen.getByRole("combobox");
        expect(select).toHaveAttribute("id", "custom-id");
    });

    it("renders dropdown icon", () => {
        const { container } = render(<Select options={options} value="" onChange={vi.fn()} />);
        const icon = container.querySelector("svg");
        expect(icon).toBeInTheDocument();
    });
});

