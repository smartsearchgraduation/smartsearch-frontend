import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, value, onChange, label, wrapperClassName, id, disabled, ...props }, ref) => {
        const generatedId = React.useId();
        const selectId = id || generatedId;

        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && (
                    <label htmlFor={selectId} className="mb-2 ml-4 block text-sm font-bold text-gray-700">
                        {label}
                    </label>
                )}

                <div
                    className={cn(
                        "relative flex items-center rounded-lg bg-white shadow-sm ring-2 ring-gray-200 transition-all duration-200",
                        "focus-within:shadow-md focus-within:ring-emerald-600",
                        disabled && "cursor-not-allowed opacity-60",
                    )}
                >
                    <select
                        id={selectId}
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={cn(
                            "w-full appearance-none rounded-lg border-none bg-transparent px-4 py-2 pr-10 text-lg text-gray-900 focus:ring-0 focus:outline-none",
                            className,
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none absolute right-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>
        );
    },
);

Select.displayName = "Select";
