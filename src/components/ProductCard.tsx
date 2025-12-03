import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { type Product } from "../lib/api";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

function ProductCard({ product }: { product: Product }) {
    const [vote, setVote] = useState<"like" | "dislike" | null>(null);

    const handleVoteClick = (e: MouseEvent<HTMLButtonElement>, voteType: "like" | "dislike") => {
        e.stopPropagation();
        e.preventDefault();

        setVote((currentVote) => {
            if (currentVote === voteType) {
                return null;
            }
            return voteType;
        });
    };

    return (
        <Card variant="interactive" className="group relative flex h-full flex-col bg-gray-200">
            {/* Image Section */}
            {product.imageUrl ? (
                <div className="aspect-square w-full">
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                </div>
            ) : (
                <div
                    role="img"
                    aria-label={product.name}
                    className="flex aspect-square w-full items-center justify-center"
                >
                    <p className="text-gray-700">No image available</p>
                </div>
            )}

            {/* Content Section */}
            <div className="flex h-full flex-col bg-gray-100 p-4">
                <h3 className="mr-auto mb-auto line-clamp-2 max-w-full font-bold sm:text-lg">
                    <Link
                        to={`/product/${product.id}`}
                        className="text-gray-900 after:absolute after:inset-0 after:z-10 after:content-['']"
                    >
                        {product.title}
                    </Link>
                </h3>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-gray-700">{product.price || "Not available"}</p>

                    {/* Vote Buttons (Z-20 to sit above the card link) */}
                    <div className="relative z-20 flex gap-2 text-transparent">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleVoteClick(e, "like")}
                            aria-label="Product is relevant"
                            aria-pressed={vote === "like"}
                            className={cn("hover:bg-gray-200", vote === "like" ? "text-blue-400" : "text-gray-400")}
                        >
                            <svg
                                className="h-5 w-5" // Fixed size for consistency
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleVoteClick(e, "dislike")}
                            aria-label="Product is not relevant"
                            aria-pressed={vote === "dislike"}
                            className={cn("hover:bg-gray-200", vote === "dislike" ? "text-red-400" : "text-gray-400")}
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="2"
                            >
                                <g transform="rotate(180 12 12)">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </g>
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default ProductCard;
