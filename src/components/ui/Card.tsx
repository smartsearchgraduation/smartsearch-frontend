import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva("bg-white ring-2 ring-gray-200 rounded-lg overflow-hidden flex flex-col", {
    variants: {
        variant: {
            default: "shadow-md",
            interactive: "shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer", // Matches ProductCard behavior
            flat: "shadow-none ring-1 bg-gray-50",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />;
});
Card.displayName = "Card";

// Optional: Header sub-component for consistency (seen in CascadingSelector and MediaGallery)
export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex-shrink-0 border-b border-gray-100 bg-gray-50 p-6", className)} {...props}>
        {children}
    </div>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);
