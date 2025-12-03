import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    wrapperClassName?: string;
    leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, wrapperClassName, label, leftIcon, type, ...props }, ref) => {
        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && <label className="mb-2 ml-4 block text-sm font-bold text-gray-700">{label}</label>}
                <div
                    className={cn(
                        "relative flex items-center rounded-[1.5rem] bg-white shadow-sm ring-2 ring-gray-200 transition-all duration-200",
                        "focus-within:shadow-md focus-within:ring-emerald-600",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                >
                    {leftIcon && <div className="pl-4 text-gray-500">{leftIcon}</div>}
                    <input
                        type={type}
                        className={cn(
                            "w-full rounded-[1.5rem] border-none bg-transparent px-6 py-3 text-lg text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none",
                            leftIcon && "pl-2", // adjust padding if icon exists
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
            </div>
        );
    },
);
Input.displayName = "Input";
