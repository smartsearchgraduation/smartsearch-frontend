import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    return (
        <div className={cn("flex items-center justify-between gap-2 px-2", className)}>
            <div className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
                <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Previous
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
