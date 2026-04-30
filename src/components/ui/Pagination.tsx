import { Button } from "./Button";
import { cn } from "../../lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    pages.push(1);

    if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
            pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
            pages.push(i);
        }
        pages.push(totalPages);
    } else {
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
    }

    return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    const pageNumbers = getPageNumbers(currentPage, totalPages);

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
                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, index) =>
                        typeof page === "number" ? (
                            <Button
                                key={index}
                                variant={page === currentPage ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => onPageChange(page)}
                                className="min-w-[32px]"
                            >
                                {page}
                            </Button>
                        ) : (
                            <span key={index} className="px-2 text-gray-500">
                                {page}
                            </span>
                        ),
                    )}
                </div>
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
