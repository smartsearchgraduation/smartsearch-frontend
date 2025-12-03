import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    wrapperClassName?: string;
    footer?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, wrapperClassName, label, footer, ...props }, ref) => {
        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">{label}</label>}
                <div
                    className={cn(
                        "flex flex-col relative bg-white ring-2 ring-gray-200 rounded-[1.5rem] shadow-sm transition-all duration-200",
                        "focus-within:ring-emerald-600 focus-within:shadow-md"
                    )}
                >
                    <textarea
                        className={cn(
                            "w-full bg-transparent border-none focus:ring-0 focus:outline-none px-6 py-4 text-gray-900 placeholder:text-gray-500 text-lg rounded-[1.5rem] resize-none",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {footer && <div className="px-6 pb-3 mt-auto">{footer}</div>}
                </div>
            </div>
        );
    }
);
Textarea.displayName = "Textarea";
