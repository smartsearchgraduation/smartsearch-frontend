import { useState, type MouseEvent, type TouchEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";

interface ImageCarouselProps {
    images?: string[];
    alt: string;
    className?: string;
    url?: string;
}

export function ImageCarousel({ images = [], alt, className, url }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px) to trigger a slide change
    const minSwipeDistance = 50;

    const hasImages = images.length > 0;
    const isMultiImage = images.length > 1;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
    };

    const handleNext = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
    };

    if (!hasImages) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={cn("flex w-full items-center justify-center bg-gray-200 text-gray-400", className)}
            >
                <div className="flex flex-col items-center">
                    <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span className="text-sm">No image</span>
                </div>
            </div>
        );
    }

    const ImageContent = (
        <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="h-full w-full object-contain transition-opacity duration-300"
        />
    );

    return (
        <div
            className={cn("group relative overflow-hidden", className)}
            onTouchStart={isMultiImage ? onTouchStart : undefined}
            onTouchMove={isMultiImage ? onTouchMove : undefined}
            onTouchEnd={isMultiImage ? onTouchEnd : undefined}
        >
            {url ? (
                <Link to={url} className="block h-full w-full">
                    {ImageContent}
                </Link>
            ) : (
                ImageContent
            )}

            {isMultiImage && (
                <>
                    {/* Navigation Buttons */}
                    <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="pointer-events-auto h-8 w-8 rounded-full bg-white/80 shadow-md hover:bg-white"
                            onClick={handlePrev}
                            aria-label="Previous image"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="pointer-events-auto h-8 w-8 rounded-full bg-white/80 shadow-md hover:bg-white"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>

                    {/* Indicators */}
                    <div className="pointer-events-none absolute right-0 bottom-2 left-0 flex justify-center gap-1.5">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full shadow-sm transition-all",
                                    idx === currentIndex ? "w-4 bg-emerald-500" : "w-1.5 bg-white/60",
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
