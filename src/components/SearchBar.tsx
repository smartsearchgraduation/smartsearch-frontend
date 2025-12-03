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
import { searchRequest } from "../lib/api";

function SearchBar(props: { className: string; onSearchSuccess: (searchId: string) => void; autofocus?: boolean }) {
    const [imageFile, setImageFile] = useState<File | null>(null); // The actual file
    const [previewUrl, setPreviewUrl] = useState<string>(""); // The blob: URL for <img src>
    const [query, setQuery] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const charLimit = 300;

    const processFile = (file: File | null | undefined) => {
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setError(null);
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
        setError(null);

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
        setError(null);
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
    const handleFormSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault(); // Prevent default form submission
        setError(null);

        if (isLoading) {
            return;
        }

        if (query.trim() === "") {
            setError("Please enter a search query.");
            return;
        }

        setIsLoading(true);

        try {
            const searchId = await searchRequest({ query, image: imageFile });

            props.onSearchSuccess(searchId);
            setQuery("");
            removeImage();

            // Reset textarea height
            if (textAreaRef.current) {
                textAreaRef.current.style.height = "auto";
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                "flex flex-col relative bg-white ring-2 ring-gray-200 rounded-[1.5rem] shadow-lg duration-200 " +
                `${error ? "ring-red-400" : "focus-within:ring-emerald-600"} ` +
                props.className
            }
            onDragOver={handleDragOver}
            onSubmit={handleFormSubmit}
        >
            {/* --- Text Area --- */}
            <div className="flex items-start w-full px-4 pt-2 pb-1">
                <textarea
                    ref={textAreaRef}
                    id="searchbar"
                    name="searchbar"
                    aria-label="Search using natural language"
                    aria-invalid={!!error}
                    aria-describedby={error ? "search-error" : undefined}
                    rows={1}
                    disabled={isLoading}
                    className="flex-grow text-lg border-none focus:outline-none focus:ring-0 bg-transparent 
                                 text-gray-900 placeholder:text-gray-500 resize-none overflow-y-auto max-h-28"
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
            {error && (
                <p id="search-error" role="alert" className="text-sm text-red-500 px-4 pb-2">
                    {error}
                </p>
            )}
            {/* --- Bottom Row --- */}
            <div className="flex justify-between items-center px-2 pt-1 pb-2">
                {/* --- Image Preview --- */}
                {previewUrl ? (
                    <div className="flex p-1">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt={imageFile ? `Preview of ${imageFile.name}` : ""}
                                className="max-w-xs max-h-24 rounded-[1rem] shadow-md pointer-events-none"
                            />
                            <button
                                onClick={removeImage}
                                type="button"
                                disabled={isLoading}
                                className="absolute top-2 right-2 w-8 h-8 p-1.5 bg-gray-900/60 hover:bg-gray-900/80 duration-200
                                 rounded-full flex items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="w-10 h-10 p-2 rounded-full text-gray-600 bg-gray-200 hover:text-gray-800 hover:bg-gray-300 
                                 duration-200 cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
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
                        className={"text-sm text-gray-500 mr-2 " + (query.length > charLimit ? "text-red-500" : "")}
                    >
                        {textAreaRef.current?.value.length || 0}/{charLimit}
                    </span>
                    {/* --- Submit Button --- */}
                    <button
                        id="submit"
                        name="submit"
                        type="submit"
                        disabled={isLoading || query.trim() === "" || query.length > charLimit}
                        className="w-10 h-10 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 duration-200 cursor-pointer 
                                shadow-md disabled:opacity-50 disabled:bg-emerald-700 disabled:hover:bg-emerald-700 disabled:cursor-not-allowed"
                        aria-label="Submit search"
                    >
                        {isLoading ? (
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
                className="absolute inset-0 rounded-[1.5rem] flex items-center justify-center text-white 
                            font-bold bg-emerald-600/80 transition-opacity duration-200"
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
