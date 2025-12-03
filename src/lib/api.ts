export interface SearchRequestInput {
    query: string;
    image: File | null;
}

export type Product = {
    id: string;
    title: string;
    price: string;
    description: string;
    images: string[];
    category: string;
    subcategory: string;
};

export interface SearchResponse {
    products: Product[];
    correctedText: string;
    rawText: string;
    searchId: string;
}

/**
 * Submits a search query (text + optional image).
 * Returns a searchId to poll or fetch results for.
 */
export async function searchRequest(input: SearchRequestInput): Promise<string> {
    const { query, image } = input;
    const formData = new FormData();
    formData.append("query", query);
    if (image) {
        formData.append("image", image);
    }

    const response = await fetch("/api/search", {
        method: "POST",
        body: formData, // Send as FormData if handling files
    });

    if (!response.ok) {
        throw new Error("Failed to submit search request");
    }

    const data = await response.json();
    return data.searchId;
}

/**
 * Fetches search results by ID.
 */
export const fetchSearchResults = async (searchId: string): Promise<SearchResponse> => {
    const response = await fetch(`/api/search-results/${searchId}`);

    if (!response.ok) {
        throw new Error("Failed to get results.");
    }

    return response.json();
};

/**
 * Fetches raw text results (for the 'Search instead for...' feature).
 */
export const getRawTextResults = async (searchId: string): Promise<string> => {
    const response = await fetch(`/api/raw-text-results/${searchId}`);
    if (!response.ok) {
        throw new Error("Failed to get raw text results");
    }
    const data = await response.json();
    return data.text;
};

/**
 * Fetches a single product by ID.
 */
export const fetchProductById = async (productId: string): Promise<Product> => {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
        throw new Error("Product not found");
    }
    return response.json();
};

/**
 * Creates a new product.
 */
export const createProduct = async (productData: Omit<Product, "id">): Promise<{ success: boolean; id: string }> => {
    const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
    });

    if (!response.ok) {
        throw new Error("Failed to create product");
    }
    return response.json();
};

/**
 * Submits a vote (like/dislike) for a product.
 */
export const voteProduct = async (productId: string, voteType: "like" | "dislike"): Promise<void> => {
    const response = await fetch(`/api/products/${productId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
        throw new Error("Failed to submit vote");
    }
};

/**
 * Uploads an image file.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
};

/**
 * Fetches the taxonomy/categories for products.
 */
export const fetchTaxonomy = async (): Promise<Record<string, string[]>> => {
    const response = await fetch("/api/taxonomy");
    if (!response.ok) {
        throw new Error("Failed to fetch taxonomy");
    }
    return response.json();
};
