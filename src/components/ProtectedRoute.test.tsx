import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
    const ADMIN_ACCESS_KEY = "smartsearch_admin_access";

    beforeEach(() => {
        // Mock localStorage
        vi.stubGlobal("localStorage", {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("Access Granted", () => {
        it("renders children when admin access is true", () => {
            vi.mocked(localStorage.getItem).mockReturnValue("true");

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(screen.getByText("Protected Content")).toBeInTheDocument();
        });

        it("renders multiple children when access granted", () => {
            vi.mocked(localStorage.getItem).mockReturnValue("true");

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>First Child</div>
                        <div>Second Child</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(screen.getByText("First Child")).toBeInTheDocument();
            expect(screen.getByText("Second Child")).toBeInTheDocument();
        });
    });

    describe("Access Denied", () => {
        it("does not render children when admin access is false", () => {
            vi.mocked(localStorage.getItem).mockReturnValue("false");

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        });

        it("does not render children when localStorage key does not exist", () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        });

        it("does not render children when localStorage returns undefined", () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        });
    });

    describe("localStorage Key", () => {
        it("checks correct localStorage key", () => {
            vi.mocked(localStorage.getItem).mockReturnValue("true");

            render(
                <MemoryRouter>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </MemoryRouter>,
            );

            expect(localStorage.getItem).toHaveBeenCalledWith(ADMIN_ACCESS_KEY);
        });
    });
});
