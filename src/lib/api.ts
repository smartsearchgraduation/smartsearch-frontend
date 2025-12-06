export interface SearchRequestInput {
    query: string;
    image: File | null;
}

export type Product = {
    product_id: string;
    name: string;
    brand: {
        brand_id: number;
        name: string;
    };
    price: number;
    description: string;
    is_relevant: boolean;
    images: string[];
    categories: {
        category_id: number;
        name: string;
        parent: {
            category_id: number;
            name: string;
        } | null;
    }[];
    subcategory: string;
};

export interface SearchResponse {
    products: Product[];
    corrected_text: string;
    search_id: string;
    raw_text: string;
}

let BASE_URL = "https://api.init-ai.com";
if (import.meta.env.DEV) {
    BASE_URL = "";
}

/**
 * Submits a search query (text + optional image).
 * Returns a searchId to poll or fetch results for.
 */
export async function searchRequest(input: SearchRequestInput): Promise<string> {
    const { query } = input;
    /* const formData = new FormData();
    formData.append("raw_text", query);
    if (image) {
        formData.append("image", image);
    } */

    const response = await fetch(BASE_URL + "/api/search", {
        method: "POST",
        body: JSON.stringify({ raw_text: query }),
        headers: { "Content-Type": "application/json" }, // Send as FormData if handling files
    });

    if (!response.ok) {
        throw new Error("Failed to submit search request");
    }

    const data = await response.json();
    return data.search_id;
}

/**
 * Fetches search results by ID.
 */
export const fetchSearchResults = async (searchId: string): Promise<SearchResponse> => {
    const startTime = performance.now();
    const response = await fetch(BASE_URL + `/api/search/${searchId}`);

    if (!response.ok) {
        throw new Error("Failed to get results.");
    }

    const data = await response.json();
    const endTime = performance.now();
    console.log(`fetchSearchResults took ${endTime - startTime}ms`);
    return data;
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
    const response = await fetch(BASE_URL + `/api/products/${productId}`);
    if (!response.ok) {
        throw new Error("Product not found");
    }
    return response.json();
};

/**
 * Fetches all products.
 */
export const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(BASE_URL + "/api/products");
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    return response.json();
};

/**
 * Input for creating a new product.
 */
export interface CreateProductInput {
    name: string;
    price: number;
    description: string;
    brand: string;
    category_ids: number[];
    images: File[];
}

/**
 * Creates a new product.
 */
export const createProduct = async (productData: CreateProductInput): Promise<{ success: boolean; id: string }> => {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("price", productData.price.toString());
    formData.append("description", productData.description);
    formData.append("brand", productData.brand);
    formData.append("category_ids", productData.category_ids.join(","));
    productData.images.forEach((imageFile) => {
        formData.append("images", imageFile);
    });

    const response = await fetch(BASE_URL + "/api/products", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to create product");
    }
    return response.json();
};

/**
 * Submits a vote (like/dislike) for a product.
 */
export const productFeedback = async (
    searchId: string,
    productId: string,
    voteType: "like" | "dislike",
): Promise<void> => {
    const response = await fetch(BASE_URL + `/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query_id: searchId,
            product_id: productId,
            is_relevant: voteType == "like",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to submit vote");
    }
};

export interface Category {
    category_id: number;
    name: string;
    parent_category_id: number | null;
}

export interface CategoryResponse {
    categories: Category[];
    total: number;
}

/**
 * Fetches the categories for products.
 */
export const fetchCatagories = async (): Promise<CategoryResponse> => {
    const response = await fetch(BASE_URL + "/api/categories");
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
};

/**
 * Fetches the brands for products.
 */
export const fetchBrands = async (): Promise<{ brand_id: number; name: string }[]> => {
    const response = await fetch(BASE_URL + "/api/brands");
    if (!response.ok) {
        throw new Error("Failed to fetch brands");
    }
    return response.json();
};

/**
 * Updates an existing product.
 */
export const updateProduct = async (
    productId: string,
    productData: CreateProductInput,
): Promise<{ success: boolean }> => {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("price", productData.price.toString());
    formData.append("description", productData.description);
    formData.append("brand", productData.brand);
    formData.append("category_ids", productData.category_ids.join(","));

    productData.images.forEach((image) => {
        formData.append("images", image);
    });

    const response = await fetch(BASE_URL + `/api/products/${productId}`, {
        method: "PUT",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to update product");
    }
    return response.json();
};
