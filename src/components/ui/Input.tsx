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
                {label && <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">{label}</label>}
                <div
                    className={cn(
                        "flex items-center relative bg-white ring-2 ring-gray-200 rounded-[1.5rem] shadow-sm transition-all duration-200",
                        "focus-within:ring-emerald-600 focus-within:shadow-md",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {leftIcon && <div className="pl-4 text-gray-500">{leftIcon}</div>}
                    <input
                        type={type}
                        className={cn(
                            "w-full bg-transparent border-none focus:ring-0 focus:outline-none px-6 py-3 text-gray-900 placeholder:text-gray-500 text-lg rounded-[1.5rem]",
                            leftIcon && "pl-2", // adjust padding if icon exists
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);
Input.displayName = "Input";
