import { useState, type MouseEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type Product } from "../api";

function ProductCard({ product }: { product: Product }) {
    const [vote, setVote] = useState<"like" | "dislike" | null>(null);
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        // Allow navigation with Enter or Spacebar
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); // Stop spacebar from scrolling
            handleCardClick();
        }
    };

    const handleVoteClick = (e: MouseEvent<HTMLButtonElement>, voteType: "like" | "dislike") => {
        e.stopPropagation();
        setVote((currentVote) => {
            if (currentVote === voteType) {
                return null;
            }
            return voteType;
        });
        // TODO: API call to update vote on the backend
    };

    const handleVoteKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
        }
    };

    return (
        <div
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            role="link"
            tabIndex={0}
            className="ring-2 ring-gray-200 rounded-lg shadow-md overflow-hidden bg-gray-200 focus:outline-2 hover:shadow-xl cursor-pointer transition-shadow duration-200"
        >
            {product.imageUrl ? (
                <div className="aspect-square w-full rounded-t-lg">
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                </div>
            ) : (
                <div className="aspect-square w-full rounded-t-lg flex items-center justify-center">
                    <p className="text-gray-700">No image available</p>
                </div>
            )}
            <div className="flex flex-col p-4 bg-gray-100">
                <h3 className="font-bold sm:text-lg mr-auto max-w-full truncate">{product.title}</h3>
                <div className="flex items-center justify-between">
                    <p className="text-gray-700">{product.price || "Not available"}</p>
                    <div className="flex gap-2 h-10 text-transparent">
                        <button
                            className={`p-2 rounded-full hover:bg-gray-200 duration-200 ${
                                vote === "like" ? "text-blue-400" : ""
                            }`}
                            onClick={(e) => handleVoteClick(e, "like")}
                            onKeyDown={handleVoteKeyDown}
                            aria-label="Product is relevant"
                        >
                            <svg
                                className="h-full"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                stroke="#222"
                                fill="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                        </button>
                        <button
                            className={`p-2 rounded-full hover:bg-gray-200 duration-200 ${
                                vote === "dislike" ? "text-red-400" : ""
                            }`}
                            onClick={(e) => handleVoteClick(e, "dislike")}
                            onKeyDown={handleVoteKeyDown}
                            aria-label="Product is not relevant"
                        >
                            <svg
                                className="h-full"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                stroke="#222"
                                fill="currentColor"
                                strokeWidth="2"
                            >
                                <g transform="rotate(180 12 12)">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
