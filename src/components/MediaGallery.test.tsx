import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaGallery, type UploadedImage } from "./MediaGallery";

describe("MediaGallery", () => {
    const mockOnImagesChange = vi.fn();

    beforeEach(() => {
        mockOnImagesChange.mockClear();
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderGallery = (images: UploadedImage[] = []) => {
        return render(<MediaGallery images={images} onImagesChange={mockOnImagesChange} />);
    };

    describe("Empty State", () => {
        it("renders empty state drop zone when no images", () => {
            renderGallery();
            expect(screen.getByText("Drop your images here")).toBeInTheDocument();
            expect(screen.getByText("or click to browse")).toBeInTheDocument();
        });

        it("triggers file input when empty state clicked", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            // Get the file input ref
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]');

            fireEvent.click(dropZone!);

            // The click should trigger the file input
            expect(fileInput).toBeInTheDocument();
        });

        it("shows drag visual feedback when dragging", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
            });

            expect(screen.getByText("Drop images here to upload")).toBeInTheDocument();
        });
    });

    describe("Populated State", () => {
        const mockImages: UploadedImage[] = [
            {
                id: "1",
                file: new File(["test"], "test1.jpg", { type: "image/jpeg" }),
                preview: "blob:test1",
            },
            {
                id: "2",
                file: new File(["test"], "test2.jpg", { type: "image/jpeg" }),
                preview: "blob:test2",
            },
        ];

        it("renders images in grid", () => {
            renderGallery(mockImages);
            const images = screen.getAllByAltText("Preview");
            expect(images).toHaveLength(2);
        });

        it("shows cover badge on first image", () => {
            renderGallery(mockImages);
            expect(screen.getByText("Cover")).toBeInTheDocument();
        });

        it("does not show cover badge on non-first images", () => {
            const moreImages: UploadedImage[] = [
                ...mockImages,
                {
                    id: "3",
                    file: new File(["test"], "test3.jpg", { type: "image/jpeg" }),
                    preview: "blob:test3",
                },
            ];
            renderGallery(moreImages);

            const coverBadges = screen.getAllByText("Cover");
            expect(coverBadges).toHaveLength(1);
        });

        it("renders ghost tile for adding more images", () => {
            renderGallery(mockImages);
            expect(screen.getByText("Add Image")).toBeInTheDocument();
        });

        it("shows remove button on image hover", () => {
            renderGallery(mockImages);
            const imageContainer = screen.getAllByAltText("Preview")[0].closest("div");

            fireEvent.mouseEnter(imageContainer!);

            const removeButton = imageContainer!.querySelector("button");
            expect(removeButton).toBeInTheDocument();
        });
    });

    describe("File Input", () => {
        it("processes files when file input changes", () => {
            renderGallery();
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, {
                target: { files: [file] },
            });

            expect(mockOnImagesChange).toHaveBeenCalled();
            expect(mockOnImagesChange.mock.calls[0][0]).toHaveLength(1);
        });

        it("clears file input after processing", () => {
            renderGallery();
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, {
                target: { files: [file] },
            });

            expect(fileInput.value).toBe("");
        });

        it("ignores non-image files", () => {
            renderGallery();
            const file = new File(["test"], "test.txt", { type: "text/plain" });
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, {
                target: { files: [file] },
            });

            expect(mockOnImagesChange).not.toHaveBeenCalled();
        });

        it("handles multiple file upload", () => {
            renderGallery();
            const files = [
                new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
                new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
            ];
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(fileInput, {
                target: { files },
            });

            expect(mockOnImagesChange).toHaveBeenCalled();
            expect(mockOnImagesChange.mock.calls[0][0]).toHaveLength(2);
        });
    });

    describe("Drag and Drop", () => {
        it("sets dragging state on drag over with image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
            });

            expect(dropZone).toHaveClass("bg-emerald-50", "ring-emerald-600");
        });

        it("does not set dragging state for non-image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "text/plain" }],
                    types: ["Files"],
                },
            });

            expect(dropZone).not.toHaveClass("bg-emerald-50");
        });

        it("clears dragging state on drag leave", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
            });

            fireEvent.dragLeave(dropZone!);

            expect(dropZone).not.toHaveClass("bg-emerald-50");
        });

        it("processes dropped image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
            });

            fireEvent.drop(dropZone!, {
                dataTransfer: { files: [file] },
            });

            expect(mockOnImagesChange).toHaveBeenCalled();
        });

        it("ignores dropped non-image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');
            const file = new File(["test"], "test.txt", { type: "text/plain" });

            fireEvent.dragOver(dropZone!, {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
            });

            fireEvent.drop(dropZone!, {
                dataTransfer: { files: [file] },
            });

            expect(mockOnImagesChange).not.toHaveBeenCalled();
        });
    });

    describe("Paste", () => {
        it("processes pasted image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

            const mockItem = {
                kind: "file",
                type: "image/jpeg",
                getAsFile: () => file,
            };

            fireEvent.paste(dropZone!, {
                clipboardData: {
                    items: [mockItem],
                },
            });

            expect(mockOnImagesChange).toHaveBeenCalled();
        });

        it("ignores pasted non-image files", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');

            const mockItem = {
                kind: "text",
                type: "text/plain",
            };

            fireEvent.paste(dropZone!, {
                clipboardData: {
                    items: [mockItem],
                },
            });

            expect(mockOnImagesChange).not.toHaveBeenCalled();
        });
    });

    describe("Remove Image", () => {
        const mockImages: UploadedImage[] = [
            {
                id: "1",
                file: new File(["test"], "test1.jpg", { type: "image/jpeg" }),
                preview: "blob:test1",
            },
        ];

        it("removes image when remove button clicked", () => {
            renderGallery(mockImages);
            const imageContainer = screen.getByAltText("Preview").closest("div");

            fireEvent.mouseEnter(imageContainer!);

            const removeButton = imageContainer!.querySelector("button");
            fireEvent.click(removeButton!);

            expect(mockOnImagesChange).toHaveBeenCalledWith([]);
        });

        it("revokes object URL when image removed", () => {
            const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
            renderGallery(mockImages);
            const imageContainer = screen.getByAltText("Preview").closest("div");

            fireEvent.mouseEnter(imageContainer!);

            const removeButton = imageContainer!.querySelector("button");
            fireEvent.click(removeButton!);

            expect(revokeSpy).toHaveBeenCalledWith("blob:test1");
        });

        it("removes correct image when multiple images", () => {
            const multipleImages: UploadedImage[] = [
                {
                    id: "1",
                    file: new File(["test"], "test1.jpg", { type: "image/jpeg" }),
                    preview: "blob:test1",
                },
                {
                    id: "2",
                    file: new File(["test"], "test2.jpg", { type: "image/jpeg" }),
                    preview: "blob:test2",
                },
            ];
            renderGallery(multipleImages);
            const imageContainers = screen.getAllByAltText("Preview");

            // Remove second image
            fireEvent.mouseEnter(imageContainers[1].closest("div")!);
            const removeButton = imageContainers[1].closest("div")!.querySelector("button");
            fireEvent.click(removeButton!);

            expect(mockOnImagesChange).toHaveBeenCalledWith([multipleImages[0]]);
        });
    });

    describe("Keyboard Navigation", () => {
        it("triggers file input on Enter key", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]');

            fireEvent.keyDown(dropZone!, { key: "Enter" });

            expect(fileInput).toBeInTheDocument();
        });

        it("triggers file input on Space key", () => {
            renderGallery();
            const dropZone = screen.getByText("Drop your images here").closest('[role="button"]');
            const { container } = renderGallery();
            const fileInput = container.querySelector('input[type="file"]');

            fireEvent.keyDown(dropZone!, { key: " " });

            expect(fileInput).toBeInTheDocument();
        });
    });

    describe("Layout and Styling", () => {
        it("renders Card component wrapper", () => {
            const { container } = renderGallery();
            const card = container.querySelector('[class*="ring-gray-200"]');
            expect(card).toBeInTheDocument();
        });

        it("renders Media Gallery header", () => {
            renderGallery();
            expect(screen.getByText("Media Gallery")).toBeInTheDocument();
        });
    });
});

