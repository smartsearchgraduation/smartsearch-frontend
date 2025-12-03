import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
        variants: {
            variant: {
                // Matches "Publish" button
                primary:
                    "bg-emerald-600 text-white ring-2 ring-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg",

                // Matches "Discard" button
                secondary: "bg-white text-gray-600 ring-2 ring-gray-200 hover:bg-gray-50 hover:shadow-md",

                // Matches SearchBar icon buttons
                ghost: "bg-transparent hover:bg-gray-200 text-gray-600 hover:text-gray-800",

                destructive: "bg-red-50 text-red-600 ring-2 ring-red-100 hover:bg-red-100",
            },
            size: {
                default: "px-6 py-2 text-sm", // Standard text buttons
                icon: "w-10 h-10 p-2", // SearchBar icons
                sm: "px-3 py-1 text-xs",
                lg: "px-8 py-3 text-lg",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    },
);
Button.displayName = "Button";
