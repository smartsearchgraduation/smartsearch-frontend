import { useState, useEffect, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { searchRequest } from "../api";

function SearchBar(props: { className: string; onSearchSuccess: (searchId: string) => void }) {
    const [imageFile, setImageFile] = useState<File | null>(null); // The actual file
    const [previewUrl, setPreviewUrl] = useState<string>(""); // The blob: URL for <img src>
    const [query, setQuery] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // A simplified helper to handle the file
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

    // --- Remove Image Handler ---
    const removeImage = () => {
        setImageFile(null);
        setError(null);
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

    // --- Form Submit Handler ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
            const { searchId } = await searchRequest({ query, image: imageFile });

            props.onSearchSuccess(searchId);
            setQuery("");
            removeImage();
        } catch (err: any) {
            setError(err.message || "An unknown error occurred. Please try again.");
        } finally {
            setIsLoading(false);
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
            className={
                "flex flex-col relative bg-gray-200 rounded-[1.5rem] shadow-md " +
                `${error ? "ring-2 ring-red-400" : ""} ` +
                props.className
            }
            onDragOver={handleDragOver}
            onSubmit={handleSubmit}
        >
            <div className="flex items-center">
                <button
                    id="addImage"
                    name="addImage"
                    onClick={handleAddImageClick}
                    type="button"
                    disabled={isLoading}
                    className="w-10 h-10 m-2 p-2 rounded-full text-gray-700 hover:bg-gray-300 duration-200 cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
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

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <input
                    id="searchbar"
                    name="searchbar"
                    type="text"
                    disabled={isLoading}
                    className="flex-grow py-1 text-lg border-none focus:outline-none focus:ring-0 bg-transparent"
                    placeholder="Search using natural language"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setError(null);
                    }}
                />

                <button
                    id="submit"
                    name="submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-10 h-10 m-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 duration-200 cursor-pointer flex-shrink-0 shadow-md 
                    disabled:opacity-80 disabled:cursor-not-allowed"
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
                            <path stroke="currentColor" strokeWidth="60" strokeLinecap="round" d="M 400 400 520 520" />
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

            <div
                className="absolute inset-0 h-48 bg-blue-500 rounded-[1.5rem] flex items-center justify-center text-white font-bold
                           opacity-0 transition-opacity duration-200"
                style={{ opacity: isDragging ? 0.8 : 0, pointerEvents: isDragging ? "auto" : "none" }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                Drop image here
            </div>

            {previewUrl && (
                <div className="flex m-4">
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Search preview"
                            className="max-w-xs max-h-24 rounded-[1rem] shadow-md pointer-events-none"
                        />
                        <button
                            onClick={removeImage}
                            type="button"
                            disabled={isLoading}
                            className="absolute top-2 right-2 w-8 h-8 p-2 bg-black/50 hover:bg-black/80 duration-200
                                 rounded-full flex items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
                            aria-label="Remove image"
                        >
                            <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    stroke="currentColor"
                                    strokeWidth="60"
                                    strokeLinecap="round"
                                    d="M 80 80 520 520 M 80 520 520 80"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500 px-5 pb-3">{error}</p>}
        </form>
    );
}

export default SearchBar;
