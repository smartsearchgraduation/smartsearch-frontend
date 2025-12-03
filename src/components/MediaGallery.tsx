import React, { useRef, useState, type ChangeEvent, type DragEvent, type ClipboardEvent } from "react";
import { Card, CardHeader, CardContent } from "./ui/Card"; // Adjust import path if needed
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

export const MediaGallery: React.FC<MediaGalleryProps> = ({ images, onImagesChange }) => {
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
                {/* Drop Zone */}
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
                        "relative ring-2 rounded-[1.5rem] p-10 text-center cursor-pointer transition-all duration-200 outline-none",
                        isDragging
                            ? "ring-emerald-600 bg-emerald-50 scale-[1.01]"
                            : "ring-gray-200 bg-gray-50 hover:bg-white hover:shadow-md focus:ring-emerald-600"
                    )}
                >
                    {/* Visual Overlay for Dragging */}
                    <div
                        className="absolute inset-0 rounded-[1.5rem] flex items-center justify-center text-white font-bold bg-emerald-600/90 transition-opacity duration-200 z-10 pointer-events-none"
                        style={{ opacity: isDragging ? 1 : 0 }}
                    >
                        Drop images here to upload
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-white ring-2 ring-gray-200 rounded-full flex items-center justify-center shadow-sm">
                            <svg
                                className="w-8 h-8 text-emerald-600"
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
                            <p className="text-lg font-bold text-gray-700">Drop your images here</p>
                            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                        </div>
                    </div>
                </div>

                {/* Image Grid Display */}
                {images.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={img.id}
                                className="group relative aspect-square bg-gray-100 ring-2 ring-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(img.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                {index === 0 && (
                                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                                        Cover
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
