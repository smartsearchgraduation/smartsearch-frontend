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

function SearchBar(props: { className: string; onSearchSuccess: (searchId: string) => void; autofocus?: boolean }) {
    const [imageFile, setImageFile] = useState<File | null>(null); // The actual file
    const [previewUrl, setPreviewUrl] = useState<string>(""); // The blob: URL for <img src>
    const [query, setQuery] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    // Removed manual isLoading and error states in favor of mutation state

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const charLimit = 300;

    // Mutation for search request
    const mutation = useMutation({
        mutationFn: searchRequest,
        onSuccess: (searchId) => {
            props.onSearchSuccess(searchId);
            setQuery("");
            removeImage();

            // Reset textarea height
            if (textAreaRef.current) {
                textAreaRef.current.style.height = "auto";
            }
        },
    });

    const processFile = (file: File | null | undefined) => {
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            mutation.reset(); // Clear any previous errors
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

        // Auto-grow logic
        event.target.style.height = "auto"; // Reset height to shrink if text is deleted
        event.target.style.height = `${event.target.scrollHeight}px`; // Set to new scroll height
    };

    // --- Paste Image Handler ---
    const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // Check if the item is a file and is an image
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
        // Clear the file input value so the same file can be re-added
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- Drag-and-Drop Handlers ---
    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        // Check if the dragged item is an image file
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
        event?.preventDefault(); // Prevent default form submission

        if (mutation.isPending) {
            return;
        }

        if (query.trim() === "") {
            // We could set a local error here, or just ignore.
            // Since the UI button is disabled when query is empty, this is a fallback.
            return;
        }

        mutation.mutate({ query, image: imageFile });
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
                    disabled={mutation.isPending}
                    className="max-h-28 flex-grow resize-none overflow-y-auto border-none bg-transparent text-lg text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none"
                    placeholder="Search using natural language"
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
                                <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        stroke="currentColor"
                                        strokeWidth="80"
                                        strokeLinecap="round"
                                        d="M 100 100 500 500 M 100 500 500 100"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        id="addImage"
                        name="addImage"
                        onClick={handleAddImageClick}
                        type="button"
                        disabled={mutation.isPending}
                        className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-full bg-gray-200 p-2 text-gray-600 duration-200 hover:bg-gray-300 hover:text-gray-800 disabled:cursor-not-allowed"
                        aria-label="Add image"
                    >
                        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                            <path
                                stroke="currentColor"
                                strokeWidth="60"
                                strokeLinecap="round"
                                d="M 300 80 300 520 M 80 300 520 300"
                            />
                        </svg>
                    </button>
                )}
                <div className="mt-auto">
                    {/* --- Character Count/Limit --- */}
                    <span
                        aria-live="polite"
                        aria-atomic="true"
                        className={"mr-2 text-sm text-gray-500 " + (query.length > charLimit ? "text-red-500" : "")}
                    >
                        {textAreaRef.current?.value.length || 0}/{charLimit}
                    </span>
                    {/* --- Submit Button --- */}
                    <button
                        id="submit"
                        name="submit"
                        type="submit"
                        disabled={mutation.isPending || query.trim() === "" || query.length > charLimit}
                        className="h-10 w-10 cursor-pointer rounded-full bg-emerald-600 p-2 text-white shadow-md duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-700"
                        aria-label="Submit search"
                    >
                        {mutation.isPending ? (
                            <svg className="animate-spin" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M 300 80 A 220 220 0 1 1 80 300"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="60"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    stroke="currentColor"
                                    strokeWidth="60"
                                    strokeLinecap="round"
                                    d="M 400 400 520 520"
                                />
                                <circle
                                    cx="240"
                                    cy="240"
                                    r="180"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="60"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            {/* --- Drag and Drop Overlay --- */}
            <div
                className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-emerald-600/80 font-bold text-white transition-opacity duration-200"
                style={{
                    opacity: isDragging ? 1 : 0,
                    pointerEvents: isDragging ? "auto" : "none",
                }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                Drop image here
            </div>
        </form>
    );
}

export default SearchBar;
