import { useRef, useEffect } from "react";
import { Card, CardHeader } from "./ui/Card";
import { cn } from "../lib/utils";
import type { Category } from "../lib/api";

interface CascadingSelectorProps {
    selectedCategoryId: number | null;
    selectedSubcategoryId: number | null;
    onCategorySelect: (id: number) => void;
    onSubcategorySelect: (id: number) => void;
    categories: Category[];
    className?: string;
}

export function CascadingSelector({
    selectedCategoryId,
    selectedSubcategoryId,
    onCategorySelect,
    onSubcategorySelect,
    categories,
    className,
}: CascadingSelectorProps) {
    const selectedCategory = categories.find((c) => c.category_id === selectedCategoryId);
    const selectedSubcategory = categories.find((c) => c.category_id === selectedSubcategoryId);

    const activeCategoryRef = useRef<HTMLLabelElement>(null);
    const activeSubCategoryRef = useRef<HTMLLabelElement>(null);

    useEffect(() => {
        if (activeCategoryRef.current) {
            activeCategoryRef.current.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        if (activeSubCategoryRef.current) {
            activeSubCategoryRef.current.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedSubcategoryId]);

    return (
        <Card className={className}>
            <CardHeader>
                <h2 className="text-lg font-bold text-gray-800">Category</h2>
            </CardHeader>

            {/* --- Main Content Area --- */}
            <div className="grid flex-1 grid-rows-2 divide-y divide-gray-100 overflow-hidden">
                {/* 1. Parent Categories */}
                <fieldset className="group flex flex-col overflow-hidden">
                    <legend className="visually-hidden">Primary Category</legend>
                    <div
                        aria-hidden="true"
                        className="flex-shrink-0 bg-gray-100 px-6 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase group-focus-within:bg-emerald-100 group-focus-within:text-emerald-900"
                    >
                        Primary Category
                    </div>
                    <div className="flex-grow space-y-2 overflow-y-auto p-4">
                        {categories
                            .filter((c) => c.parent_category_id === null)
                            .map((category) => (
                                <label
                                    key={category.category_id}
                                    ref={selectedCategoryId === category.category_id ? activeCategoryRef : null}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2",
                                        selectedCategoryId === category.category_id
                                            ? "bg-emerald-100 text-emerald-900 shadow-sm ring-2 ring-emerald-600"
                                            : "text-gray-600 hover:bg-gray-100",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="primary_category"
                                        className="visually-hidden"
                                        checked={selectedCategoryId === category.category_id}
                                        onChange={() => onCategorySelect(category.category_id)}
                                    />
                                    <span>{category.name}</span>
                                    {selectedCategoryId === category.category_id && (
                                        <svg
                                            className="h-5 w-5 text-emerald-900"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    )}
                                </label>
                            ))}
                    </div>
                </fieldset>

                {/* 2. Sub Categories */}
                <fieldset className="group flex flex-col overflow-hidden bg-gray-50">
                    <legend className="visually-hidden">Sub Category</legend>
                    <div
                        aria-hidden="true"
                        className="flex-shrink-0 bg-gray-200/50 px-6 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase group-focus-within:bg-emerald-100 group-focus-within:text-emerald-900"
                    >
                        Sub Category
                    </div>
                    <div className="flex-grow space-y-2 overflow-y-auto p-4">
                        {!selectedCategory ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400 opacity-60">
                                <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <span className="text-sm font-medium">Select a primary category</span>
                            </div>
                        ) : (
                            categories
                                .filter((c) => c.parent_category_id === selectedCategory.category_id)
                                .map((sub) => (
                                    <label
                                        key={sub.category_id}
                                        ref={selectedSubcategoryId === sub.category_id ? activeSubCategoryRef : null}
                                        className={cn(
                                            "flex cursor-pointer items-center rounded-lg px-4 py-3 text-sm transition-all duration-200",
                                            selectedSubcategoryId === sub.category_id
                                                ? "scale-[1.02] bg-white shadow-md ring-2 ring-emerald-600"
                                                : "hover:bg-white hover:shadow-sm",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="subtag"
                                            checked={selectedSubcategoryId === sub.category_id}
                                            onChange={() => onSubcategorySelect(sub.category_id)}
                                            className="h-4 w-4 border-gray-300 text-emerald-900 accent-emerald-600 focus:outline-none"
                                        />
                                        <span
                                            className={cn(
                                                "ml-3",
                                                selectedSubcategoryId === sub.category_id
                                                    ? "font-bold text-gray-900"
                                                    : "font-medium text-gray-600",
                                            )}
                                        >
                                            {sub.name}
                                        </span>
                                    </label>
                                ))
                        )}
                    </div>
                </fieldset>
            </div>

            {/* --- Summary Footer --- */}
            <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4 text-center text-xs text-gray-600">
                {selectedCategory && selectedSubcategory ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="rounded-md bg-gray-200 px-2 py-1 font-bold text-gray-800">
                            {selectedCategory.name}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="rounded-md bg-emerald-200 px-2 py-1 font-bold text-emerald-900">
                            {selectedSubcategory.name}
                        </span>
                    </div>
                ) : (
                    <div className="py-1 font-bold">Incomplete selection</div>
                )}
            </div>
        </Card>
    );
}
