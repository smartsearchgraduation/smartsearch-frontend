import { useRef, useState, type ChangeEvent, type DragEvent, type ClipboardEvent } from "react";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { cn } from "../lib/utils";

// --- Types ---
export interface UploadedImage {
    file: File;
    id: string;
    preview: string;
}

interface MediaGalleryProps {
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
}

export function MediaGallery({ images, onImagesChange }: MediaGalleryProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFiles = (files: FileList | null | undefined) => {
        if (!files || files.length === 0) return;

        const newImages: UploadedImage[] = [];

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                newImages.push({
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    preview: URL.createObjectURL(file),
                });
            }
        });

        if (newImages.length > 0) {
            onImagesChange([...images, ...newImages]);
        }
    };

    // --- Input Handlers ---
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        event.preventDefault();
        if (isDragging) {
            processFiles(event.dataTransfer.files);
        }
        setIsDragging(false);
    };

    // --- Paste Handler ---
    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file" && item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            event.preventDefault();
            const newImages: UploadedImage[] = files.map((file) => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                preview: URL.createObjectURL(file),
            }));
            onImagesChange([...images, ...newImages]);
        }
    };

    // --- Cleanup Logic ---
    const removeImage = (id: string) => {
        const imageToRemove = images.find((img) => img.id === id);
        if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
        onImagesChange(images.filter((img) => img.id !== id));
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-800">Media Gallery</h2>
            </CardHeader>

            <CardContent>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {images.length === 0 ? (
                        /* --- Empty State: Big Drop Zone --- */
                        <div
                            role="button"
                            tabIndex={0}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onPaste={handlePaste}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    fileInputRef.current?.click();
                                }
                            }}
                            className={cn(
                                "relative col-span-2 flex flex-col items-center justify-center rounded-lg text-center ring-2 transition-all duration-200 outline-none sm:col-span-4 aspect-[2/1] sm:aspect-[4/1]",
                                isDragging
                                    ? "scale-[1.01] bg-emerald-50 ring-emerald-600"
                                    : "bg-gray-50 ring-gray-200 hover:bg-white hover:shadow-md focus:ring-emerald-600",
                            )}
                        >
                            {/* Visual Overlay for Dragging */}
                            <div
                                className={cn(
                                    "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-emerald-600/90 font-bold text-white transition-opacity duration-200",
                                    isDragging ? "opacity-100" : "opacity-0",
                                )}
                            >
                                Drop images here to upload
                            </div>

                            <div className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-gray-200">
                                    <svg
                                        className="h-8 w-8 text-emerald-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-700">Drop your images here</h3>
                                    <p className="mt-1 text-sm text-gray-500">or click to browse</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- Populated State: Grid + Ghost Tile --- */
                        <>
                            {/* Existing Images */}
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-sm ring-2 ring-gray-200 transition-all hover:shadow-md"
                                >
                                    <img src={img.preview} alt="Preview" className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(img.id);
                                        }}
                                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-gray-900/60 p-1.5 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-900/80"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>

                                    {index === 0 && (
                                        <span className="absolute bottom-2 left-2 rounded-md bg-emerald-600/90 px-2 py-1 text-[10px] font-bold text-white uppercase shadow-sm backdrop-blur-sm">
                                            Cover
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Ghost Tile (Drop Zone) */}
                            <div
                                role="button"
                                tabIndex={0}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onPaste={handlePaste}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        fileInputRef.current?.click();
                                    }
                                }}
                                className={cn(
                                    "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all outline-none",
                                    isDragging
                                        ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                                        : "border-gray-300 bg-gray-50 hover:border-emerald-500 hover:bg-white focus:border-emerald-500",
                                )}
                            >
                                <svg
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        isDragging ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-600"
                                    )}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <span className={cn(
                                    "mt-2 text-xs font-medium",
                                    isDragging ? "text-emerald-700" : "text-gray-500"
                                )}>
                                    Add Image
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
