import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, children, className, title, description, footer }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab" || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.addEventListener("keydown", handleTab);
            document.body.style.overflow = "hidden";

            // Focus first focusable element when modal opens
            setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                );
                if (focusableElements?.[0]) {
                    (focusableElements[0] as HTMLElement)?.focus();
                }
            }, 0);
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.removeEventListener("keydown", handleTab);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className={cn(
                    "animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl duration-200",
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                aria-describedby={description ? "modal-description" : undefined}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div>
                            {title && (
                                <h2 id="modal-title" className="text-lg font-bold text-gray-900">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-description" className="text-sm text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full p-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                )}

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end border-t-2 border-gray-200 bg-gray-100 px-6 py-4">{footer}</div>
                )}
            </div>
        </div>,
        document.body,
    );
}
