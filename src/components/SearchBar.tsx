import {
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
    type KeyboardEvent,
    type ClipboardEvent,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { searchRequest } from "../lib/api";
import { Tooltip } from "./ui/Tooltip";
import { Icons } from "./ui/Icons";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";

function SearchBar(props: {
    className: string;
    onSearchSuccess: (searchId: string, searchDuration?: number) => void;
    autofocus?: boolean;
    initialValue?: string;
}) {
    const [imageFile, setImageFile] = useState<File | null>(null); // The actual file
    const [previewUrl, setPreviewUrl] = useState<string>(""); // The blob: URL for <img src>
    const [query, setQuery] = useState<string>(props.initialValue || "");
    const [isDragging, setIsDragging] = useState(false);
    type SearchMode = "std" | "iwt" | "twi";
    const [searchMode, setSearchMode] = useState<SearchMode>("std");
    const [correctionEnabled, setCorrectionEnabled] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const startTimeRef = useRef<number | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const modeButtonRef = useRef<HTMLButtonElement>(null);
    const charLimit = 300;

    // Sync query with initialValue prop
    useEffect(() => {
        if (props.initialValue !== undefined) {
            setQuery(props.initialValue);
        }
    }, [props.initialValue]);

    // Auto-resize textarea when query changes
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [query]);

    // Close popover when clicking outside
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

    // Mutation for search request
    const mutation = useMutation({
        mutationFn: searchRequest,
        onSuccess: (searchId) => {
            const endTime = performance.now();
            const duration = startTimeRef.current ? endTime - startTimeRef.current : 0;
            props.onSearchSuccess(searchId, duration);
            setQuery("");
            removeImage();
            // Height reset is handled by the query useEffect
        },
    });

    const convertImageToWebP = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            img.onload = () => {
                const MAX_SIZE = 1080;
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    return reject(new Error("Failed to get canvas context"));
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (!blob) return reject(new Error("Canvas to Blob conversion failed"));
                        const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                            type: "image/webp",
                        });
                        resolve(webpFile);
                    },
                    "image/webp",
                    0.96,
                );
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(objectUrl);
                reject(err);
            };
        });
    };

    const processFile = async (file: File | null | undefined) => {
        if (file && file.type.startsWith("image/")) {
            try {
                const convertedFile = await convertImageToWebP(file);
                setImageFile(convertedFile);
                mutation.reset(); // Clear any previous errors
            } catch (error) {
                console.error("Image conversion failed:", error);
                // Fallback to original if conversion fails, or handle error appropriate
                // For now, let's just not set it if it fails to ensure we don't send bad data
            }
        }
    };

    // --- Input Handlers ---
    // Runs when the user selects a file from the dialog
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        processFile(event.target.files?.[0]);
    };

    // Runs when the user clicks the "+" button
    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    // Handles text changes and auto-grows the textarea
    const handleQueryChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(event.target.value);
        mutation.reset(); // Clear errors on new input
    };

    // --- Paste Image Handler ---
    const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file" && item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                    processFile(file);
                    event.preventDefault();
                    break;
                }
            }
        }
    };

    // --- Remove Image Handler ---
    const removeImage = () => {
        setImageFile(null);
        mutation.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- Drag-and-Drop Handlers ---
    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        let isImageFile = false;
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                const item = event.dataTransfer.items[i];
                if (item.kind === "file" && item.type.startsWith("image/")) {
                    isImageFile = true;
                    break;
                }
            }
        } else {
            isImageFile = event.dataTransfer.types.includes("Files");
        }

        if (isImageFile) {
            event.preventDefault();
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (isDragging) {
            event.preventDefault(); // Prevent the file from opening in the browser
            processFile(event.dataTransfer.files?.[0]);
        }
        setIsDragging(false);
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
        mutation.mutate({ query, image: imageFile, correctionEnabled, searchMode });
    };

    // --- Submit on Enter (but not Shift+Enter) ---
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent new line
            handleFormSubmit();
        }
    };

    // --- Memory Cleanup & Preview URL Effect ---
    useEffect(() => {
        let objectUrl: string | null = null;

        if (imageFile) {
            objectUrl = URL.createObjectURL(imageFile);
            setPreviewUrl(objectUrl);
        } else {
            setPreviewUrl("");
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [imageFile]);

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
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
                {/* --- Image Preview --- */}
                {previewUrl ? (
                    <div className="flex p-1">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt={imageFile ? `Preview of ${imageFile.name}` : ""}
                                className="pointer-events-none max-h-24 max-w-xs rounded-[1rem] shadow-md"
                            />
                            <button
                                onClick={removeImage}
                                type="button"
                                disabled={mutation.isPending}
                                className="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-900/60 p-1.5 text-white duration-200 hover:bg-gray-900/80 disabled:cursor-not-allowed"
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
                <div className="mt-auto flex items-center gap-2">
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
                    <div className="relative">
                        <Tooltip
                            content={
                                searchMode === "std"
                                    ? "Standard mode: text↔text, image↔image, hybrid↔hybrid matching"
                                    : searchMode === "iwt"
                                      ? "Image with text: cross-modal search using text query to find images"
                                      : "Text with image: cross-modal search using image query to find text descriptions"
                            }
                        >
                            <button
                                ref={modeButtonRef}
                                type="button"
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 duration-200 hover:bg-gray-300 hover:text-gray-800"
                                aria-label={`Current mode: ${searchMode}, click to change`}
                                aria-expanded={isSettingsOpen}
                                aria-haspopup="true"
                            >
                                <span>{searchMode}</span>
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
                                                    searchMode === "std"
                                                        ? "left-0"
                                                        : searchMode === "iwt"
                                                          ? "left-[33.33%]"
                                                          : "left-[66.66%]"
                                                }`}
                                            />
                                            <div className="relative flex w-full p-1">
                                                <Tooltip content="Standard mode: text↔text, image↔image, hybrid↔hybrid matching">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchMode("std")}
                                                        className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                                        aria-pressed={searchMode === "std"}
                                                    >
                                                        std
                                                    </button>
                                                </Tooltip>
                                                <Tooltip content="Image with text: cross-modal search using text query to find images">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchMode("iwt")}
                                                        className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                                        aria-pressed={searchMode === "iwt"}
                                                    >
                                                        iwt
                                                    </button>
                                                </Tooltip>
                                                <Tooltip content="Text with image: cross-modal search using image query to find text descriptions">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchMode("twi")}
                                                        className="flex-1 cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                                                        aria-pressed={searchMode === "twi"}
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
