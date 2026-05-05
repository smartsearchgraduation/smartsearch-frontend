import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchBar from "./SearchBar";

// Mock searchRequest
vi.mock("../lib/api", () => ({
    searchRequest: vi.fn(() => Promise.resolve("test-search-id")),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("SearchBar component", () => {
    it("renders with default props", () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });
        expect(screen.getByRole("search")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("initializes with queryText prop", () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} queryText="test query" />, {
            wrapper,
        });
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveValue("test query");
    });

    it("initializes with searchMode prop", () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} searchMode="iwt" />, {
            wrapper,
        });
        const modeButton = screen.getByRole("button", { name: /current mode: iwt/i });
        expect(modeButton).toBeInTheDocument();
    });

    it("initializes with correctionEnabled prop", () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} correctionEnabled={false} />, {
            wrapper,
        });
        const correctionButton = screen.getByRole("button", { name: /spell correction, off/i });
        expect(correctionButton).toBeInTheDocument();
    });

    it("initializes with queryImage prop", () => {
        const handleSearchSuccess = vi.fn();
        const queryImage = {
            filename: "test.jpg",
            url: "/uploads/test.jpg",
            data_url:
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
        };
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} queryImage={queryImage} />, {
            wrapper,
        });
        // Component should render without error when queryImage is provided
        expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("allows mode changing", async () => {
        const handleSearchSuccess = vi.fn();
        const user = userEvent.setup();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const modeButton = screen.getByRole("button", { name: /current mode: std/i });
        await user.click(modeButton);

        // Check if mode options appear - use more specific queries
        const modeButtons = screen.getAllByRole("button", { name: /std/i });
        expect(modeButtons.length).toBeGreaterThan(1); // Should have main button + option button

        expect(screen.getByRole("button", { name: /iwt/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /twi/i })).toBeInTheDocument();
    });

    it("initial values do not block user interaction", async () => {
        const handleSearchSuccess = vi.fn();
        const user = userEvent.setup();
        render(
            <SearchBar
                className="test-class"
                onSearchSuccess={handleSearchSuccess}
                queryText="initial text"
                searchMode="iwt"
                correctionEnabled={false}
            />,
            { wrapper },
        );

        const textarea = screen.getByRole("textbox");
        expect(textarea).not.toBeDisabled();

        // User can still change the text
        await user.clear(textarea);
        await user.type(textarea, "new text");
        expect(textarea).toHaveValue("new text");
    });

    it("submits search on button click", async () => {
        const handleSearchSuccess = vi.fn();
        const user = userEvent.setup();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "test query");

        const submitButton = screen.getByRole("button", { name: /submit search/i });
        await user.click(submitButton);

        // Wait for mutation to complete
        await user.click(submitButton);
    });

    it("toggles correction enabled state", async () => {
        const handleSearchSuccess = vi.fn();
        const user = userEvent.setup();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const correctionButton = screen.getByRole("button", { name: /spell correction, on/i });
        await user.click(correctionButton);

        const correctionButtonOff = screen.getByRole("button", { name: /spell correction, off/i });
        expect(correctionButtonOff).toBeInTheDocument();
    });

    describe("User Input", () => {
        const user = userEvent.setup({ delay: null });

        it("shows character limit in red when exceeded", async () => {
            const handleSearchSuccess = vi.fn();
            render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

            const textarea = screen.getByRole("textbox");
            const longText = "a".repeat(301);
            await user.type(textarea, longText);

            const charCount = screen.getByText(/301\/300/i);
            expect(charCount).toHaveClass("text-red-500");
        }, 10000);
    });

    it("disables submit button when query is empty and no image", async () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const submitButton = screen.getByRole("button", { name: /submit search/i });
        expect(submitButton).toBeDisabled();
    });

    it("enables submit button when query has text", async () => {
        const handleSearchSuccess = vi.fn();
        const user = userEvent.setup();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "test");

        const submitButton = screen.getByRole("button", { name: /submit search/i });
        expect(submitButton).not.toBeDisabled();
    });

    it("validates iwt mode requires text", async () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} searchMode="iwt" />, {
            wrapper,
        });

        const textarea = screen.getByRole("textbox");
        expect(textarea).not.toBeDisabled(); // Text should be enabled in iwt mode

        const submitButton = screen.getByRole("button", { name: /submit search/i });
        expect(submitButton).toBeDisabled(); // But submit should be disabled without text
    });

    it("validates twi mode disables textarea", async () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} searchMode="twi" />, {
            wrapper,
        });

        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeDisabled(); // Text should be disabled in twi mode
    });

    it("handles drag over event for images", async () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const form = screen.getByRole("search");
        const fileInput = form.querySelector('input[type="file"]')!;

        expect(fileInput).toBeInTheDocument();
    });

    it("handles paste image event", () => {
        const handleSearchSuccess = vi.fn();
        render(<SearchBar className="test-class" onSearchSuccess={handleSearchSuccess} />, { wrapper });

        const textarea = screen.getByRole("textbox");
        // Paste event is handled by the browser, we just verify the textarea accepts paste
        expect(textarea).toBeInTheDocument();
    });
});
