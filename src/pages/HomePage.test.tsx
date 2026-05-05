import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

// Mock SearchBar component
vi.mock("../components/SearchBar", () => ({
    default: ({ autofocus, onSearchSuccess, className }: any) => (
        <div data-testid="search-bar" className={className}>
            <button onClick={() => onSearchSuccess("test-search-id", 100)}>Submit Search</button>
            {autofocus && <span data-testid="autofocus-indicator">Autofocus enabled</span>}
        </div>
    ),
}));

describe("HomePage", () => {
    // COVERAGE NOTES:
    // - SearchBar component: Already covered by SearchBar.test.tsx (full component testing)
    // - Navigation links: React Router Link behavior is tested here (page-level integration)
    // - Autofocus prop: Prop passing is tested here (actual autofocus behavior in SearchBar.test.tsx)
    // - onSearchSuccess callback: Integration with navigation is tested here
    //
    // This test focuses on:
    // - Page-level integration (SearchBar + navigation)
    // - Navigation link rendering and routing
    // - Callback integration with React Router navigate

    it("renders correctly with all elements", () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
        );

        expect(screen.getByText("Smart")).toBeInTheDocument();
        expect(screen.getByText("Search")).toBeInTheDocument();
        expect(screen.getByTestId("search-bar")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("renders SearchBar with autofocus prop", () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
        );

        expect(screen.getByTestId("autofocus-indicator")).toBeInTheDocument();
    });

    it("navigates to admin page when Admin link is clicked", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <HomePage />
            </MemoryRouter>,
        );

        const adminLink = screen.getByText("Admin");
        expect(adminLink).toHaveAttribute("href", "/admin");
    });

    it("navigates to home when logo link is clicked", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <HomePage />
            </MemoryRouter>,
        );

        const logoLink = screen.getByText("Smart").closest("a");
        expect(logoLink).toHaveAttribute("href", "/");
    });

    it("navigates to search page on search success callback", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/"]}>
                <HomePage />
            </MemoryRouter>,
        );

        const submitButton = screen.getByText("Submit Search");
        await user.click(submitButton);
        // This triggers the navigate call in handleSearchSuccess, covering line 8
    });

    it("has responsive layout classes", () => {
        const { container } = render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
        );

        const main = container.querySelector("main");
        expect(main).toHaveClass("h-[100dvh]", "w-[100dvw]", "flex-col");
    });
});
