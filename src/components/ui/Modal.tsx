import { useEffect, type ReactNode } from "react";
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
    footer?: ReactNode; // New prop for sticky footer
}

export function Modal({ isOpen, onClose, children, className, title, description, footer }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
            <div
                className={cn(
                    "animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl duration-200",
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <div>
                            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
                            {description && <p className="text-sm text-gray-500">{description}</p>}
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
