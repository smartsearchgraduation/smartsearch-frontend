import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSearchImage from "./useSearchImage";
import { type QueryImage } from "../lib/api";

describe("useSearchImage", () => {
    const mockOnImageChange = vi.fn();

    beforeEach(() => {
        mockOnImageChange.mockClear();
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderHookWithProps = (queryImage?: QueryImage) => {
        return renderHook(() => useSearchImage({ queryImage, onImageChange: mockOnImageChange }));
    };

    describe("State Returns", () => {
        it("returns imageFile state initialized to null", () => {
            const { result } = renderHookWithProps();
            expect(result.current.imageFile).toBeNull();
        });

        it("returns previewUrl state initialized to empty string", () => {
            const { result } = renderHookWithProps();
            expect(result.current.previewUrl).toBe("");
        });

        it("returns isDragging state initialized to false", () => {
            const { result } = renderHookWithProps();
            expect(result.current.isDragging).toBe(false);
        });

        it("returns fileInputRef", () => {
            const { result } = renderHookWithProps();
            expect(result.current.fileInputRef).toHaveProperty("current");
        });

        it("returns all handler functions", () => {
            const { result } = renderHookWithProps();
            expect(result.current.handleFileChange).toBeInstanceOf(Function);
            expect(result.current.handleAddImageClick).toBeInstanceOf(Function);
            expect(result.current.handlePaste).toBeInstanceOf(Function);
            expect(result.current.removeImage).toBeInstanceOf(Function);
            expect(result.current.handleDragOver).toBeInstanceOf(Function);
            expect(result.current.handleDragLeave).toBeInstanceOf(Function);
            expect(result.current.handleDrop).toBeInstanceOf(Function);
        });
    });

    describe("Query Image Restoration", () => {
        it("does not restore previewUrl when queryImage is undefined", () => {
            const { result } = renderHookWithProps();
            expect(result.current.previewUrl).toBe("");
        });

        it("does not restore previewUrl when queryImage has no data_url", () => {
            const queryImage: QueryImage = {
                filename: "test.jpg",
                url: "https://example.com/test.jpg",
                data_url: "",
            };
            const { result } = renderHookWithProps(queryImage);
            expect(result.current.previewUrl).toBe("");
        });
    });

    describe("File Input Handling", () => {
        it("handleAddImageClick triggers file input click", () => {
            const { result } = renderHookWithProps();
            const mockClick = vi.fn();
            result.current.fileInputRef.current = { click: mockClick } as any;

            act(() => {
                result.current.handleAddImageClick();
            });

            expect(mockClick).toHaveBeenCalled();
        });

        it("handleFileChange ignores non-image files", () => {
            const { result } = renderHookWithProps();
            const file = new File(["test"], "test.txt", { type: "text/plain" });
            const mockEvent = { target: { files: [file] } } as any;

            act(() => {
                result.current.handleFileChange(mockEvent);
            });

            expect(result.current.imageFile).toBeNull();
            expect(mockOnImageChange).not.toHaveBeenCalled();
        });
    });

    describe("Paste Handling", () => {
        it("handlePaste extracts image from clipboard", () => {
            const { result } = renderHookWithProps();
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockItem = {
                kind: "file",
                type: "image/jpeg",
                getAsFile: () => file,
            };
            const mockEvent = {
                clipboardData: {
                    items: [mockItem],
                },
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handlePaste(mockEvent);
            });

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it("handlePaste ignores non-image clipboard items", () => {
            const { result } = renderHookWithProps();
            const mockItem = {
                kind: "text",
                type: "text/plain",
            };
            const mockEvent = {
                clipboardData: {
                    items: [mockItem],
                },
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handlePaste(mockEvent);
            });

            expect(result.current.imageFile).toBeNull();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it("handlePaste handles empty clipboard", () => {
            const { result } = renderHookWithProps();
            const mockEvent = {
                clipboardData: null,
            } as any;

            act(() => {
                result.current.handlePaste(mockEvent);
            });

            expect(result.current.imageFile).toBeNull();
        });
    });

    describe("Remove Image", () => {
        it("removeImage clears imageFile and previewUrl", () => {
            const { result } = renderHookWithProps();

            act(() => {
                result.current.fileInputRef.current = { value: "test" } as any;
            });

            act(() => {
                result.current.removeImage();
            });

            expect(result.current.imageFile).toBeNull();
            expect(result.current.previewUrl).toBe("");
            expect(mockOnImageChange).toHaveBeenCalled();
            expect(result.current.fileInputRef.current?.value).toBe("");
        });
    });

    describe("Drag and Drop", () => {
        it("handleDragOver sets isDragging to true for image files", () => {
            const { result } = renderHookWithProps();
            const mockEvent = {
                dataTransfer: {
                    items: [{ kind: "file", type: "image/jpeg" }],
                    types: ["Files"],
                },
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handleDragOver(mockEvent);
            });

            expect(result.current.isDragging).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it("handleDragOver does not set isDragging for non-image files", () => {
            const { result } = renderHookWithProps();
            const mockEvent = {
                dataTransfer: {
                    items: [{ kind: "file", type: "text/plain" }],
                    types: ["Files"],
                },
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handleDragOver(mockEvent);
            });

            expect(result.current.isDragging).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it("handleDragLeave sets isDragging to false", () => {
            const { result } = renderHookWithProps();
            const mockEvent = {
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handleDragOver({
                    dataTransfer: {
                        items: [{ kind: "file", type: "image/jpeg" }],
                        types: ["Files"],
                    },
                    preventDefault: vi.fn(),
                } as any);
            });

            act(() => {
                result.current.handleDragLeave(mockEvent);
            });

            expect(result.current.isDragging).toBe(false);
        });

        it("handleDrop does not process when not dragging", () => {
            const { result } = renderHookWithProps();
            const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockEvent = {
                dataTransfer: {
                    files: [file],
                },
                preventDefault: vi.fn(),
            } as any;

            act(() => {
                result.current.handleDrop(mockEvent);
            });

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });
    });
});

