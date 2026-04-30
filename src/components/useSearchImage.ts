import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from "react";
import type { QueryImage } from "../lib/api";

function useSearchImage(props: { queryImage?: QueryImage; onImageChange: () => void }) {
    const [imageFile, setImageFile] = useState<File | null>(null); // The actual file
    const [previewUrl, setPreviewUrl] = useState<string>(""); // The blob: URL for <img src>
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Restore query image from props (for search results page)
    useEffect(() => {
        if (props.queryImage?.data_url) {
            setPreviewUrl(props.queryImage.data_url);
        }
    }, [props.queryImage]);

    const convertImageToWebP = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            img.onload = () => {
                const MAX_SIZE = 1080;
                const MAX_FILE_SIZE = 1_000_000; // 1MB
                let { width, height } = img;

                // Skip compression if already WebP, within size limits, and under file size threshold
                if (
                    file.type === "image/webp" &&
                    width <= MAX_SIZE &&
                    height <= MAX_SIZE &&
                    file.size <= MAX_FILE_SIZE
                ) {
                    URL.revokeObjectURL(objectUrl);
                    return resolve(file);
                }

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
                props.onImageChange(); // Clear any previous errors
            } catch (error) {
                console.error("Image conversion failed:", error);
                // Fallback to original if conversion fails, or handle error appropriate
                // For now, let's just not set it if it fails to ensure we don't send bad data
            }
        }
    };

    // Runs when the user selects a file from the dialog
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        processFile(event.target.files?.[0]);
    };

    // Runs when the user clicks the "+" button
    const handleAddImageClick = () => {
        fileInputRef.current?.click();
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
        setPreviewUrl("");
        props.onImageChange();
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

    return {
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
    };
}

export default useSearchImage;
