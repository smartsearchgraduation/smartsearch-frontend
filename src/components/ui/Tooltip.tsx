import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    className?: string;
}

export const Tooltip = ({ children, content, className }: TooltipProps) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const childRef = React.useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (childRef.current && content.trim()) {
            const rect = childRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 45, // Position above the element with more space
                left: rect.left + rect.width / 2, // Center horizontally
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
            {isVisible && content.trim() && (
                <div
                    className="pointer-events-none fixed z-50 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    {content}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
