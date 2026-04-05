import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    className?: string;
}

const isContentEmpty = (content: React.ReactNode): boolean => {
    if (content == null || content === false || content === "") return true;
    if (typeof content === "string") return content.trim() === "";
    return false;
};

export const Tooltip = ({ children, content, className }: TooltipProps) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0, arrowPosition: 50 });
    const childRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const updatePosition = React.useCallback(() => {
        if (childRef.current && tooltipRef.current && !isContentEmpty(content)) {
            const rect = childRef.current.getBoundingClientRect();
            const tooltipWidth = tooltipRef.current.offsetWidth;
            const screenWidth = window.innerWidth;
            const margin = 22; // Margin from screen edge

            // Calculate center position
            let left = rect.left + rect.width / 2;
            let arrowPosition = 50; // Default: center (50%)

            // Adjust if tooltip would go off the right edge
            if (left + tooltipWidth / 2 > screenWidth - margin) {
                const originalLeft = left;
                left = screenWidth - margin - tooltipWidth / 2;
                // Calculate how much we shifted and adjust arrow position
                const shiftAmount = originalLeft - left;
                arrowPosition = 50 + (shiftAmount / tooltipWidth) * 100;
            }
            // Adjust if tooltip would go off the left edge
            else if (left - tooltipWidth / 2 < margin) {
                const originalLeft = left;
                left = margin + tooltipWidth / 2;
                // Calculate how much we shifted and adjust arrow position
                const shiftAmount = originalLeft - left;
                arrowPosition = 50 + (shiftAmount / tooltipWidth) * 100;
            }

            // Ensure arrow position stays within bounds (0% to 100%)
            arrowPosition = Math.max(10, Math.min(90, arrowPosition));

            const tooltipHeight = tooltipRef.current.offsetHeight;
            setPosition({
                top: rect.top - tooltipHeight - 8,
                left: left,
                arrowPosition: arrowPosition,
            });
        }
    }, [content]);

    React.useEffect(() => {
        if (isVisible) {
            updatePosition();
        }
    }, [isVisible, updatePosition]);

    const handleMouseEnter = () => {
        if (childRef.current && !isContentEmpty(content)) {
            // Set initial position
            const rect = childRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 45,
                left: rect.left + rect.width / 2,
                arrowPosition: 50,
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div className="relative inline-block">
            <div
                ref={childRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={cn("inline-block", className)}
            >
                {children}
            </div>
            {isVisible && !isContentEmpty(content) && (
                <div
                    ref={tooltipRef}
                    className="pointer-events-none fixed z-50 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    {content}
                    <div
                        className="absolute bottom-0 translate-y-full"
                        style={{
                            left: `${position.arrowPosition}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
