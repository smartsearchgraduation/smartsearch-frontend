import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card, CardHeader, CardContent } from "./Card";

describe("Card", () => {
    it("renders children", () => {
        render(<Card>Card content</Card>);
        expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("renders with default variant", () => {
        const { container } = render(<Card>Default card</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass("shadow-md");
    });

    it("renders with interactive variant", () => {
        const { container } = render(<Card variant="interactive">Interactive card</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass("hover:shadow-xl", "transition-shadow", "cursor-pointer");
    });

    it("renders with flat variant", () => {
        const { container } = render(<Card variant="flat">Flat card</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass("shadow-none", "ring-1", "bg-gray-50");
    });

    it("merges className prop", () => {
        const { container } = render(<Card className="custom-class">Card</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass("custom-class");
    });

    it("forwards ref", () => {
        const ref = { current: null };
        render(<Card ref={ref}>Card</Card>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});

describe("CardHeader", () => {
    it("renders children", () => {
        render(<CardHeader>Header content</CardHeader>);
        expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("has correct default classes", () => {
        const { container } = render(<CardHeader>Header</CardHeader>);
        const header = container.firstChild as HTMLElement;
        expect(header).toHaveClass("border-b", "bg-gray-50", "p-4");
    });

    it("merges className prop", () => {
        const { container } = render(<CardHeader className="custom-class">Header</CardHeader>);
        const header = container.firstChild as HTMLElement;
        expect(header).toHaveClass("custom-class");
    });
});

describe("CardContent", () => {
    it("renders children", () => {
        render(<CardContent>Content</CardContent>);
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("has correct default classes", () => {
        const { container } = render(<CardContent>Content</CardContent>);
        const content = container.firstChild as HTMLElement;
        expect(content).toHaveClass("p-4");
    });

    it("merges className prop", () => {
        const { container } = render(<CardContent className="custom-class">Content</CardContent>);
        const content = container.firstChild as HTMLElement;
        expect(content).toHaveClass("custom-class");
    });
});

describe("Card with subcomponents", () => {
    it("renders nested card components", () => {
        render(
            <Card>
                <CardHeader>Header</CardHeader>
                <CardContent>Content</CardContent>
            </Card>,
        );
        expect(screen.getByText("Header")).toBeInTheDocument();
        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
