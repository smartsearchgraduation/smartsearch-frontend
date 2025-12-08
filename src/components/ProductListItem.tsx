import type { Product } from "../lib/api";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface ProductListItemProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export function ProductListItem({ product, onEdit, onDelete }: ProductListItemProps) {
    return (
        <Card className="col-span-full grid grid-cols-subgrid items-center gap-6 p-4 transition-colors hover:bg-gray-50">
            {/* Image Section */}
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name + " thumbnail"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Main Info */}
            <div className="flex min-w-0 flex-col gap-2">
                <h2 className="truncate text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="line-clamp-2 text-sm text-gray-500">{product.description}</p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-200 px-2.5 py-1 text-sm font-medium text-gray-800">
                        {product.brand.name}
                    </span>
                </div>
            </div>

            {/* Category Info */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase">
                    {product.categories.find((c) => c.parent !== null)?.parent?.name || "Uncategorized"}
                </span>
                <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold tracking-wider text-emerald-900 uppercase">
                    {product.subcategory}
                </span>
            </div>

            {/* Price */}
            <div className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</div>

            {/* Actions */}
            <div className="flex flex-col gap-2 text-right">
                <Button
                    variant="ghost"
                    onClick={() => onEdit(product)}
                    className="text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
                >
                    Edit
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => onDelete(product)}
                    className="text-red-600 hover:bg-red-100 hover:text-red-800"
                >
                    Delete
                </Button>
            </div>
        </Card>
    );
}
