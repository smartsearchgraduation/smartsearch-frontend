import { useState, useEffect, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchRequest, type QueryImage } from "../lib/api";
import { Tooltip } from "./ui/Tooltip";
import { Icons } from "./ui/Icons";
import { Button } from "./ui/Button";
import SearchModeMenu, { type SearchMode } from "./SearchModeMenu";
import useSearchImage from "./useSearchImage";

function SearchBar(props: {
    className: string;
    onSearchSuccess: (searchId: string, searchDuration?: number) => void;
    autofocus?: boolean;
    queryText?: string;
    queryImage?: QueryImage;
    searchMode?: "std" | "iwt" | "twi";
    correctionEnabled?: boolean;
}) {
    const [query, setQuery] = useState<string>(props.queryText || "");
    const [searchMode, setSearchMode] = useState<SearchMode>(props.searchMode || "std");
    const [correctionEnabled, setCorrectionEnabled] = useState(props.correctionEnabled ?? true);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const startTimeRef = useRef<number | null>(null);
    const charLimit = 300;

    // Sync query with queryText prop
    useEffect(() => {
        if (props.queryText !== undefined) {
            setQuery(props.queryText);
        }
    }, [props.queryText]);

    // Auto-resize textarea when query changes
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [query]);

    // Mutation for search request
    const mutation = useMutation({
        mutationFn: searchRequest,
    });

    const {
        imageFile,
        previewUrl,
        isDragging,
        fileInputRef,
        handleFileChange,
        handleAddImageClick,
        handlePaste,
        removeImage,
        handleDragOver,
        handleDragLeave,
        handleDrop,
    } = useSearchImage({
        queryImage: props.queryImage,
        onImageChange: mutation.reset,
    });

    const handleSearchSuccess = (searchId: string) => {
        const endTime = performance.now();
        const duration = startTimeRef.current ? endTime - startTimeRef.current : 0;
        props.onSearchSuccess(searchId, duration);
        setQuery("");
        removeImage();
        // Height reset is handled by the query useEffect
    };

    // --- Input Handlers ---
    // Handles text changes and auto-grows the textarea
    const handleQueryChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(event.target.value);
        mutation.reset(); // Clear errors on new input
    };

    // --- Form Submit Logic ---
    const handleFormSubmit = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        if (mutation.isPending) {
            return;
        }

        // Validation based on mode
        if (searchMode === "iwt" && query.trim() === "") {
            return; // iwt requires text
        }

        if (searchMode === "twi" && !imageFile) {
            return; // twi requires image
        }

        if (searchMode === "std" && query.trim() === "" && !imageFile) {
            return; // std needs text or image
        }

        startTimeRef.current = performance.now();
        mutation.mutate(
            { query: query.trim(), image: imageFile, correctionEnabled, searchMode },
            { onSuccess: handleSearchSuccess },
        );
    };

    // --- Submit on Enter (but not Shift+Enter) ---
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent new line
            handleFormSubmit();
        }
    };

    return (
        <form
            role="search"
            className={
                "relative flex flex-col rounded-[1.5rem] bg-white shadow-lg ring-2 ring-gray-200 duration-200 " +
                `${mutation.error ? "ring-red-400" : "focus-within:ring-emerald-600"} ` +
                props.className
            }
            onDragOver={handleDragOver}
            onSubmit={handleFormSubmit}
        >
            {/* --- Text Area --- */}
            <div className="flex w-full items-start px-4 pt-2 pb-1">
                <textarea
                    ref={textAreaRef}
                    id="searchbar"
                    name="searchbar"
                    aria-label="Search using natural language"
                    aria-invalid={!!mutation.error}
                    aria-describedby={mutation.error ? "search-error" : undefined}
                    rows={1}
                    disabled={mutation.isPending || searchMode === "twi"}
                    className="max-h-28 flex-grow resize-none overflow-y-auto border-none bg-transparent text-lg text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={
                        searchMode === "iwt"
                            ? "Describe the image you're looking for"
                            : searchMode === "twi"
                              ? "Upload an image to find matching text descriptions"
                              : "Search using natural language"
                    }
                    autoFocus={props.autofocus || false}
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                />
            </div>
            {/* Hidden file input */}
            <input
                type="file"
                aria-label="Add image"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {/* Visually-hidden announcements for screen readers */}
            <div className="visually-hidden" role="status" aria-live="polite">
                {isDragging ? "Drop image here to upload" : ""}
            </div>
            {/* --- Error Message --- */}
            {mutation.error && (
                <p id="search-error" role="alert" className="px-4 pb-2 text-sm text-red-500">
                    {mutation.error.message || "An error occurred. Please try again."}
                </p>
            )}
            {/* --- Bottom Row --- */}
            <div className="flex items-center gap-6 px-2 pt-1 pb-2">
                {/* --- Image Preview --- */}
                {previewUrl ? (
                    <div className="flex flex-1 p-1">
                        <div className="relative w-full">
                            <img
                                src={previewUrl}
                                alt={imageFile ? `Preview of ${imageFile.name}` : ""}
                                className={`pointer-events-none h-24 w-full rounded-[1rem] object-cover shadow-md ${searchMode === "iwt" ? "opacity-50 blur-[1px] grayscale" : ""}`}
                                onError={() => removeImage()}
                            />
                            <button
                                onClick={removeImage}
                                type="button"
                                disabled={mutation.isPending}
                                className="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-900/60 p-1.5 text-white duration-200 hover:bg-gray-900/80 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Remove image"
                            >
                                <Icons.X />
                            </button>
                        </div>
                    </div>
                ) : (
                    <Tooltip content="Add image">
                        <Button
                            id="addImage"
                            name="addImage"
                            onClick={handleAddImageClick}
                            type="button"
                            disabled={mutation.isPending || searchMode === "iwt"}
                            variant="gray"
                            size="icon"
                            className="flex-shrink-0"
                            aria-label="Add image"
                        >
                            <Icons.Plus className="h-5 w-5" />
                        </Button>
                    </Tooltip>
                )}
                {/* --- Controls Row --- */}
                <div className="mt-auto ml-auto flex flex-shrink-0 items-center gap-2">
                    {/* --- Character Count/Limit --- */}
                    <span
                        aria-live="polite"
                        aria-atomic="true"
                        className={"text-sm text-gray-500 " + (query.length > charLimit ? "text-red-500" : "")}
                    >
                        {textAreaRef.current?.value.length || 0}/{charLimit}
                    </span>
                    {/* Correction Toggle */}
                    <Tooltip content={correctionEnabled ? "Spell correction: ON" : "Spell correction: OFF"}>
                        <Button
                            type="button"
                            onClick={() => setCorrectionEnabled(!correctionEnabled)}
                            variant="gray"
                            size="icon"
                            className="flex-shrink-0"
                            aria-label={`Spell correction, ${correctionEnabled ? "on" : "off"}`}
                            aria-pressed={correctionEnabled}
                        >
                            {correctionEnabled ? <Icons.SpellCheck /> : <Icons.SpellCheck2 />}
                        </Button>
                    </Tooltip>
                    {/* Mode Button with Dropdown */}
                    <SearchModeMenu searchMode={searchMode} onSearchModeChange={setSearchMode} />
                    {/* --- Submit Button --- */}
                    <Button
                        id="submit"
                        name="submit"
                        type="submit"
                        disabled={mutation.isPending || (query.trim() === "" && !imageFile) || query.length > charLimit}
                        variant="primary"
                        size="icon"
                        aria-label="Submit search"
                    >
                        {mutation.isPending ? (
                            <svg
                                className="h-5 w-5 animate-spin"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <Icons.Search />
                        )}
                    </Button>
                </div>
            </div>
            {/* --- Drag and Drop Overlay --- */}
            <div
                className={
                    "absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-emerald-600/80 font-bold text-white transition-opacity duration-200 " +
                    (isDragging ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
                }
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                Drop image here
            </div>
        </form>
    );
}

export default SearchBar;
