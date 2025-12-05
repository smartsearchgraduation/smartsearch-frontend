import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    wrapperClassName?: string;
    footer?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, wrapperClassName, label, footer, id, ...props }, ref) => {
        const generatedId = React.useId();
        const textareaId = id || generatedId;

        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && (
                    <label htmlFor={textareaId} className="mb-2 ml-4 block text-sm font-bold text-gray-700">
                        {label}
                    </label>
                )}
                <div
                    className={cn(
                        "transition-alloverflow-hidden relative flex flex-col rounded-lg bg-white shadow-sm ring-2 ring-gray-200 duration-200",
                        "focus-within:shadow-md focus-within:ring-emerald-600",
                    )}
                >
                    <textarea
                        id={textareaId}
                        className={cn(
                            "w-full resize-none rounded-lg border-none bg-transparent px-4 py-2 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />
                    {footer && <div className="mt-auto px-4 pb-2">{footer}</div>}
                </div>
            </div>
        );
    },
);
Textarea.displayName = "Textarea";
