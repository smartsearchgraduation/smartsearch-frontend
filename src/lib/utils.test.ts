import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
    it("should merge class names correctly", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
        const condition = false;
        expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
    });

    it("should handle undefined and null values", () => {
        expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should merge Tailwind classes correctly", () => {
        // twMerge should handle conflicting Tailwind classes
        expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("should handle empty input", () => {
        expect(cn()).toBe("");
    });
});
