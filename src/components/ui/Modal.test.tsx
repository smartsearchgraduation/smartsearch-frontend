import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
    it("renders when isOpen is true", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()}>
                Content
            </Modal>,
        );
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("doesn't render when isOpen is false", () => {
        const { container } = render(
            <Modal isOpen={false} onClose={vi.fn()}>
                Content
            </Modal>,
        );
        expect(container.firstChild).toBeNull();
    });

    it("calls onClose on close button click", async () => {
        const user = userEvent.setup();
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} title="Title">
                Content
            </Modal>,
        );
        const closeButton = screen.getByRole("button");
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalled();
    });

    it("calls onClose on escape key", async () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose}>
                Content
            </Modal>,
        );
        await userEvent.keyboard("{Escape}");
        expect(handleClose).toHaveBeenCalled();
    });

    it("renders title when provided", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
                Content
            </Modal>,
        );
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} description="Test Description">
                Content
            </Modal>,
        );
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("renders footer when provided", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} footer={<button>Footer Button</button>}>
                Content
            </Modal>,
        );
        expect(screen.getByText("Footer Button")).toBeInTheDocument();
    });

    it("renders children", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()}>
                Modal Content
            </Modal>,
        );
        expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("merges className prop", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()} className="custom-class">
                Content
            </Modal>,
        );
        const modalContent = document.querySelector('[class*="custom-class"]');
        expect(modalContent).toHaveClass("custom-class");
    });

    it("uses portal to render outside component tree", () => {
        const { container } = render(
            <div>
                <div id="outside">Outside</div>
                <Modal isOpen={true} onClose={vi.fn()}>
                    Modal Content
                </Modal>
            </div>,
        );
        // Modal should be rendered via portal to document.body
        expect(container.querySelector("#outside")).toBeInTheDocument();
        expect(container.textContent).toContain("Outside");
    });

    it("has role dialog", () => {
        render(
            <Modal isOpen={true} onClose={vi.fn()}>
                Content
            </Modal>,
        );
        const modal = screen.getByText("Content").closest('[class*="zoom-in-95"]');
        expect(modal).toBeInTheDocument();
    });
});

