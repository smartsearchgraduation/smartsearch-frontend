import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icons } from "./Icons";

describe("Icons", () => {
    const iconNames = Object.keys(Icons);

    it("all icons render without error", () => {
        iconNames.forEach((iconName) => {
            const IconComponent = Icons[iconName as keyof typeof Icons];
            const { container } = render(<IconComponent />);
            const svg = container.querySelector("svg");
            expect(svg).toBeInTheDocument();
        });
    });

    it("all icons have necessary SVG attributes", () => {
        iconNames.forEach((iconName) => {
            const IconComponent = Icons[iconName as keyof typeof Icons];
            const { container } = render(<IconComponent />);
            const svg = container.querySelector("svg") as SVGSVGElement;

            // Check essential attributes
            expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
            expect(svg).toHaveAttribute("viewBox");
            expect(svg).toHaveAttribute("fill");
            expect(svg).toHaveAttribute("stroke");
        });
    });

    it("icon className prop works", () => {
        const { container } = render(<Icons.Search className="custom-class" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("custom-class");
    });

    it("icon size prop works (width and height)", () => {
        const { container } = render(<Icons.Search width={32} height={32} />);
        const svg = container.querySelector("svg") as SVGSVGElement;
        expect(svg).toHaveAttribute("width", "32");
        expect(svg).toHaveAttribute("height", "32");
    });
});
