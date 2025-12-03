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
                {label && <label className="mb-2 ml-4 block text-sm font-bold text-gray-700">{label}</label>}
                <div
                    className={cn(
                        "transition-alloverflow-hidden relative flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-2 ring-gray-200 duration-200",
                        "focus-within:shadow-md focus-within:ring-emerald-600",
                    )}
                >
                    <textarea
                        className={cn(
                            "w-full resize-none rounded-[1.5rem] border-none bg-transparent px-6 py-4 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />
                    {footer && <div className="mt-auto px-6 pb-3">{footer}</div>}
                </div>
            </div>
        );
    },
);
Textarea.displayName = "Textarea";
