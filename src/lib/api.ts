export interface SearchRequestInput {
    query: string;
    image: File | null;
    correctionEnabled?: boolean;
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
    is_relevant: boolean | null;
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
    rank?: number;
    score?: number;
    text_score?: number | null;
    image_score?: number | null;
    combined_score?: number;
};

export type FusionType = "late_fusion" | "early_fusion" | "text_only" | "image_only" | "db_fallback";

export interface SearchResponse {
    products: Product[];
    corrected_text: string;
    search_id: string;
    raw_text: string;
    fusion_type: FusionType;
    textual_model_name: string;
    visual_model_name: string;
}

export interface DbFallbackProduct {
    product_id: number;
    name: string;
    price: number;
    score: number;
    brand: { brand_id: number; name: string };
    images: string[];
}

export interface DbFallbackResponse {
    original_search_id: number;
    search_text: string;
    products: DbFallbackProduct[];
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
    const formData = new FormData();
    formData.append("raw_text", input.query);
    if (input.image) {
        formData.append("images", input.image);
    }
    formData.append("correction_enabled", input.correctionEnabled === false ? "false" : "true");

    const response = await fetch(BASE_URL + "/api/search", {
        method: "POST",
        body: formData,
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
    const response = await fetch(BASE_URL + `/api/search/${searchId}`);
    if (!response.ok) {
        throw new Error("Failed to get results.");
    }

    const data = await response.json();
    return data;
};

/**
 * Fetches traditional DB search results for comparison with semantic search.
 */
export const fetchDbFallback = async (searchId: string): Promise<DbFallbackResponse> => {
    const response = await fetch(BASE_URL + "/api/search/db-fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_id: searchId }),
    });
    if (!response.ok) {
        throw new Error("Failed to fetch DB fallback results");
    }
    return response.json();
};

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
export const fetchProducts = async (): Promise<{ products: Product[]; total: 7 }> => {
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
    return (await response.json()).brands;
};

export interface ProductImage {
    product_id: number;
    image: string;
}

export interface ProductImagesResponse {
    product_id: number;
    images: ProductImage[];
    total: number;
}

/**
 * Fetches the cover image for a product.
 */
export const fetchProductImage = async (productId: string): Promise<ProductImage> => {
    const response = await fetch(BASE_URL + `/api/products/${productId}/image`);
    if (!response.ok) {
        throw new Error("Failed to fetch product image");
    }
    return response.json();
};

/**
 * Fetches all images for a product.
 */
export const fetchProductImages = async (productId: string): Promise<ProductImagesResponse> => {
    const response = await fetch(BASE_URL + `/api/products/${productId}/images`);
    if (!response.ok) {
        throw new Error("Failed to fetch product images");
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

/**
 * Deletes an existing product.
 */
export const deleteProduct = async (productId: string): Promise<{ success: boolean }> => {
    const response = await fetch(BASE_URL + `/api/products/${productId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete product");
    }
    return response.json();
};

/**
 * Records the duration of a search request (from user click to results view).
 */
export const recordSearchDuration = async (
    searchId: string,
    searchDuration: number,
    productLoadDuration: number,
): Promise<void> => {
    console.log(
        `Recording search duration. Request: ${Math.round(searchDuration)}ms, Load: ${Math.round(productLoadDuration)}ms`,
    );
    try {
        await fetch(BASE_URL + "/api/analytics/search-duration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                search_id: searchId,
                search_duration: searchDuration,
                product_load_duration: productLoadDuration,
            }),
        });
    } catch (error) {
        console.error("Failed to record search duration", error);
    }
};

export interface SearchData {
    search_id: number;
    backend_total_time: number;
    correction_time: number;
    db_time: number;
    faiss_time: number;
    product_load_duration: number;
    search_duration: number;
    relevancy_score?: number;
    result_count: number;
}

export const fetchDurationStatistics = async (): Promise<SearchData[]> => {
    const response = await fetch(BASE_URL + "/api/analytics/logs");
    if (!response.ok) {
        throw new Error("Failed to fetch duration statistics");
    }
    return response.json();
};

export interface ModelOption {
    name: string;
    dimension: number;
}

export interface RetrievalModelsResponse {
    status: string;
    data: {
        textual_models: ModelOption[];
        visual_models: ModelOption[];
        defaults: {
            textual: string;
            visual: string;
        };
    };
}

export interface RetrievalIndexStatsResponse {
    status: string;
    indices: Record<
        string,
        {
            textual: number;
            visual: number;
            fused: number;
        }
    >;
}

export interface RetrievalStatsResponse {
    status: string;
    data: {
        index_stats: Record<string, unknown>;
        available_models: Record<string, unknown>;
        selected_models: {
            textual_model: string;
            visual_model: string;
            fusion_endpoint?: string;
            last_updated: string;
        };
        service_status: string;
    };
}

export interface SaveAndRebuildRequest {
    textual_model: string;
    visual_model: string;
    fusion_endpoint: string;
    wait_duration_seconds: number;
}

export interface SaveAndRebuildResponse {
    status: string;
    data: {
        textual_model: string;
        visual_model: string;
        total_products: number;
        successful_count: number;
        failed_count: number;
        total_duration_ms: number;
    };
    errors: Array<Record<string, unknown>>;
}

export interface CorrectionModelsResponse {
    status: string;
    data: {
        engines: {
            name: string;
            description: string;
        }[];
        defaults: {
            engine: string;
        };
        selected_engine?: string;
    };
}

export interface SaveCorrectionEngineRequest {
    engine: string;
}

export interface SaveCorrectionEngineResponse {
    status: string;
    message: string;
    data: {
        engine: string;
    };
}

export const fetchRetrievalModels = async (): Promise<RetrievalModelsResponse> => {
    const response = await fetch(BASE_URL + "/api/retrieval/models");
    if (!response.ok) {
        throw new Error("Failed to fetch retrieval models");
    }
    return response.json();
};

export const fetchRetrievalStats = async (): Promise<RetrievalStatsResponse> => {
    const response = await fetch(BASE_URL + "/api/retrieval/stats");
    if (!response.ok) {
        throw new Error("Failed to fetch retrieval stats");
    }
    return response.json();
};

export const fetchRetrievalIndexStats = async (): Promise<RetrievalIndexStatsResponse> => {
    const response = await fetch(BASE_URL + "/api/retrieval/index-stats");
    if (!response.ok) {
        throw new Error("Failed to fetch retrieval index stats");
    }
    return response.json();
};

export const saveAndRebuildSelectedRetrievalModels = async (
    payload: SaveAndRebuildRequest,
): Promise<SaveAndRebuildResponse> => {
    const response = await fetch(BASE_URL + "/api/retrieval/selected-models/save-and-rebuild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error("Failed to save retrieval models and rebuild index");
    }
    return response.json();
};

export const fetchCorrectionModels = async (): Promise<CorrectionModelsResponse> => {
    const response = await fetch(BASE_URL + "/api/correction/models");
    if (!response.ok) {
        throw new Error("Failed to fetch correction models");
    }
    return response.json();
};

export const saveSelectedCorrectionEngine = async (
    payload: SaveCorrectionEngineRequest,
): Promise<SaveCorrectionEngineResponse> => {
    const response = await fetch(BASE_URL + "/api/correction/selected-engine/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error("Failed to save correction engine");
    }
    return response.json();
};
