import { Card, CardHeader } from "./ui/Card"; // Adjust import path if needed
import { cn } from "../lib/utils";

interface CascadingSelectorProps {
    selectedTag: string | null;
    selectedSubtag: string | null;
    onTagSelect: (tag: string) => void;
    onSubtagSelect: (sub: string) => void;
    Data: Record<string, string[]>;
}

export function CascadingSelector({
    selectedTag,
    selectedSubtag,
    onTagSelect,
    onSubtagSelect,
    Data,
}: CascadingSelectorProps) {
    return (
        <Card className="h-[600px]">
            <CardHeader>
                <h2 className="text-lg font-bold text-gray-800">Category</h2>
            </CardHeader>

            {/* --- Main Content Area --- */}
            <div className="grid h-full flex-1 grid-rows-2 divide-y divide-gray-100 overflow-hidden">
                {/* 1. Parent Categories */}
                <div className="flex h-full flex-col overflow-hidden">
                    <div className="flex-shrink-0 bg-gray-100 px-6 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                        Primary Category
                    </div>
                    <div className="flex-grow space-y-2 overflow-y-auto p-4">
                        {Object.keys(Data).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onTagSelect(tag)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold transition-all duration-200",
                                    selectedTag === tag
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-100"
                                        : "text-gray-600 hover:bg-gray-100",
                                )}
                            >
                                {tag}
                                {selectedTag === tag && (
                                    <svg
                                        className="h-5 w-5 text-emerald-600"
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
                <div className="flex h-full flex-col overflow-hidden bg-gray-50">
                    <div className="flex-shrink-0 bg-gray-200/50 px-6 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                        Sub Category
                    </div>
                    <div className="flex-grow space-y-2 overflow-y-auto p-4">
                        {!selectedTag ? (
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
                            Data[selectedTag].map((sub) => (
                                <label
                                    key={sub}
                                    className={cn(
                                        "flex cursor-pointer items-center rounded-lg px-4 py-3 text-sm transition-all duration-200",
                                        selectedSubtag === sub
                                            ? "scale-[1.02] bg-white shadow-md ring-2 ring-emerald-500"
                                            : "hover:bg-white hover:shadow-sm",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="subtag"
                                        checked={selectedSubtag === sub}
                                        onChange={() => onSubtagSelect(sub)}
                                        className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span
                                        className={cn(
                                            "ml-3",
                                            selectedSubtag === sub
                                                ? "font-bold text-gray-900"
                                                : "font-medium text-gray-600",
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
            <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4 text-center text-xs text-gray-500">
                {selectedTag && selectedSubtag ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 font-bold text-gray-600">{selectedTag}</span>
                        <span className="text-gray-300">/</span>
                        <span className="rounded-md bg-emerald-100 px-2 py-1 font-bold text-emerald-700">
                            {selectedSubtag}
                        </span>
                    </div>
                ) : (
                    <div className="py-1 font-bold">Incomplete selection</div>
                )}
            </div>
        </Card>
    );
}
