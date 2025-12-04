import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./Input";

export interface ComboboxOption {
    value: string | number;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function Combobox({
    options,
    value,
    onChange,
    label,
    placeholder = "Select or type...",
    className,
    id,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const generatedId = React.useId();
    const comboId = id || generatedId;

    // Close on click outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options based on the current text value
    const filteredOptions = React.useMemo(() => {
        if (!value) return options;
        return options.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
    }, [value, options]);

    React.useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions.length, isOpen]);

    // Scroll highlighted item into view
    React.useEffect(() => {
        if (isOpen && listRef.current && filteredOptions.length > 0) {
            const list = listRef.current;
            const element = list.children[highlightedIndex] as HTMLElement;
            if (element) {
                const listTop = list.scrollTop;
                const listBottom = listTop + list.clientHeight;
                const elementTop = element.offsetTop;
                const elementBottom = elementTop + element.clientHeight;

                if (elementTop < listTop) {
                    list.scrollTop = elementTop;
                } else if (elementBottom > listBottom) {
                    list.scrollTop = elementBottom - list.clientHeight;
                }
            }
        }
    }, [highlightedIndex, isOpen, filteredOptions.length]);

    // Handle Typing: Just pass the text up
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    // Handle Selection
    const handleSelect = (option: ComboboxOption) => {
        onChange(option.label);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev === filteredOptions.length - 1 ? 0 : prev + 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev === 0 ? filteredOptions.length - 1 : prev - 1));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
                setIsOpen(false);
            }
        }, 0);
    };

    return (
        <div className={cn("w-full", className)} ref={containerRef} onBlur={handleBlur}>
            {label && (
                <label
                    htmlFor={comboId}
                    className="mb-2 ml-4 block text-sm font-bold text-gray-700"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <Input
                    id={comboId}
                    value={value} // Controlled directly by parent
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pr-10"
                />

                {/* Chevron: Click to toggle open/close */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute top-0 right-0 flex h-full w-10 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>

                {isOpen && (
                    <ul
                        ref={listRef}
                        className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5"
                    >
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-500">
                                No matching brands found. You can add "{value}".
                            </li>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isHighlighted = index === highlightedIndex;

                                // Visual check: Does the typed value match this option exactly?
                                const isSelected = value.toLowerCase() === option.label.toLowerCase();

                                return (
                                    <li
                                        key={option.value}
                                        onClick={() => handleSelect(option)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors",
                                            isHighlighted
                                                ? "bg-emerald-100 font-semibold text-emerald-900"
                                                : "text-gray-700",
                                            isSelected && "font-semibold",
                                        )}
                                    >
                                        {option.label}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
