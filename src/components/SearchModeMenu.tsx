import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/Card";
import { Icons } from "./ui/Icons";
import { Tooltip } from "./ui/Tooltip";

export type SearchMode = "std" | "iwt" | "twi";

function getSearchModeTooltip(searchMode: SearchMode) {
    return searchMode === "std"
        ? "Standard mode: text↔text, image↔image, hybrid↔hybrid matching"
        : searchMode === "iwt"
          ? "Image with text: cross-modal search using text query to find images"
          : "Text with image: cross-modal search using image query to find text descriptions";
}

function SearchModeMenu(props: { searchMode: SearchMode; onSearchModeChange: (searchMode: SearchMode) => void }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const modeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isSettingsOpen &&
                popoverRef.current &&
                modeButtonRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !modeButtonRef.current.contains(event.target as Node)
            ) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSettingsOpen]);

    return (
        <div className="relative">
            <Tooltip content={getSearchModeTooltip(props.searchMode)}>
                <button
                    ref={modeButtonRef}
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 duration-200 hover:bg-gray-300 hover:text-gray-800"
                    aria-label={`Current mode: ${props.searchMode}, click to change`}
                    aria-expanded={isSettingsOpen}
                    aria-haspopup="true"
                >
                    <span>{props.searchMode}</span>
                    <Icons.ChevronDown className="h-4 w-4" />
                </button>
            </Tooltip>
            {isSettingsOpen && (
                <div ref={popoverRef} className="absolute top-full right-0 z-50 mt-4">
                    <Card className="rounded-[1.5rem]">
                        <CardContent className="p-4">
                            <p className="mb-2 ml-2 text-sm font-medium text-gray-700">Search Mode</p>
                            <div className="relative flex overflow-hidden rounded-full border border-gray-200 bg-white">
                                {/* Moving highlight background */}
                                <div
                                    className={`absolute h-full w-[calc(33.33%)] bg-emerald-200 transition-all duration-200 ${
                                        props.searchMode === "std"
                                            ? "left-0"
                                            : props.searchMode === "iwt"
                                              ? "left-[33.33%]"
                                              : "left-[66.66%]"
                                    }`}
                                />
                                <div className="relative flex w-full p-1">
                                    <Tooltip content="Standard mode: text↔text, image↔image, hybrid↔hybrid matching">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                props.onSearchModeChange("std");
                                            }}
                                            className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                            aria-pressed={props.searchMode === "std"}
                                        >
                                            std
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Image with text: cross-modal search using text query to find images">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                props.onSearchModeChange("iwt");
                                            }}
                                            className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                            aria-pressed={props.searchMode === "iwt"}
                                        >
                                            iwt
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Text with image: cross-modal search using image query to find text descriptions">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                props.onSearchModeChange("twi");
                                            }}
                                            className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                            aria-pressed={props.searchMode === "twi"}
                                        >
                                            twi
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default SearchModeMenu;
