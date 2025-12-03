import React from "react";
import { Card, CardHeader } from "./ui/Card"; // Adjust import path if needed
import { cn } from "../lib/utils";

interface CascadingSelectorProps {
    selectedTag: string | null;
    selectedSubtag: string | null;
    onTagSelect: (tag: string) => void;
    onSubtagSelect: (sub: string) => void;
    Data: Record<string, string[]>;
}

export const CascadingSelector: React.FC<CascadingSelectorProps> = ({
    selectedTag,
    selectedSubtag,
    onTagSelect,
    onSubtagSelect,
    Data,
}) => {
    return (
        <Card className="h-[600px]">
            <CardHeader>
                <h2 className="text-lg font-bold text-gray-800">Category</h2>
            </CardHeader>

            {/* --- Main Content Area --- */}
            <div className="flex-1 grid grid-rows-2 h-full divide-y divide-gray-100 overflow-hidden">
                {/* 1. Parent Categories */}
                <div className="flex flex-col overflow-hidden h-full">
                    <div className="px-6 py-2 bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
                        Primary Category
                    </div>
                    <div className="overflow-y-auto p-4 space-y-2 flex-grow">
                        {Object.keys(Data).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onTagSelect(tag)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex justify-between items-center transition-all duration-200",
                                    selectedTag === tag
                                        ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {tag}
                                {selectedTag === tag && (
                                    <svg
                                        className="w-5 h-5 text-emerald-600"
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
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Sub Categories */}
                <div className="flex flex-col overflow-hidden h-full bg-gray-50">
                    <div className="px-6 py-2 bg-gray-200/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
                        Sub Category
                    </div>
                    <div className="overflow-y-auto p-4 space-y-2 flex-grow">
                        {!selectedTag ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            Data[selectedTag].map((sub) => (
                                <label
                                    key={sub}
                                    className={cn(
                                        "flex items-center px-4 py-3 rounded-lg cursor-pointer text-sm transition-all duration-200",
                                        selectedSubtag === sub
                                            ? "bg-white shadow-md ring-2 ring-emerald-500 scale-[1.02]"
                                            : "hover:bg-white hover:shadow-sm"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="subtag"
                                        checked={selectedSubtag === sub}
                                        onChange={() => onSubtagSelect(sub)}
                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                    />
                                    <span
                                        className={cn(
                                            "ml-3",
                                            selectedSubtag === sub
                                                ? "text-gray-900 font-bold"
                                                : "text-gray-600 font-medium"
                                        )}
                                    >
                                        {sub}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- Summary Footer --- */}
            <div className="p-4 bg-white border-t border-gray-100 text-xs text-center text-gray-500 flex-shrink-0">
                {selectedTag && selectedSubtag ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-600">{selectedTag}</span>
                        <span className="text-gray-300">/</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">
                            {selectedSubtag}
                        </span>
                    </div>
                ) : (
                    <div className="py-1 font-bold">Incomplete selection</div>
                )}
            </div>
        </Card>
    );
};
