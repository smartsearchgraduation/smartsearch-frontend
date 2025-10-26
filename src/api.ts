export interface SearchRequestResponse {
    searchId: string;
}

export interface SearchRequestInput {
    query: string;
    image: File | null;
}

export type Product = {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    price: string;
    title: string;
};

export async function searchRequest(input: SearchRequestInput): Promise<SearchRequestResponse> {
    const { query, image } = input;

    const formData = new FormData();
    formData.append("query", query);
    if (image) {
        formData.append("image", image, image.name);
    }

    // Mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // throw new Error("An unknown network error occurred.");
    return { searchId: query };

    try {
        const response = await fetch("/api/search", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const message = errData.message || `Request failed with status ${response.status}`;
            throw new Error(message);
        }

        return await response.json();
    } catch (err: any) {
        throw new Error(err.message || "An unknown network error occurred.");
    }
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const fetchSearchResults = async (searchId: string) => {
    // Mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockData: { products: Product[]; correctedText: string; rawText: string } = {
        products: [
            {
                id: "1",
                name: "Product 1",
                imageUrl: "https://placehold.co/400",
                description: "Description 1",
                price: currencyFormatter.format(10.99),
                title: "Title 1",
            },
            {
                id: "2",
                name: "Product 2",
                imageUrl: "https://placehold.co/400",
                description: "Description 2",
                price: currencyFormatter.format(20.97),
                title: "Title 2",
            },
            {
                id: "3",
                name: "Product 3",
                imageUrl: "https://placehold.co/400",
                description: "Description 3",
                price: currencyFormatter.format(30.5),
                title: "Title 3",
            },
            {
                id: "4",
                name: "Product 4",
                imageUrl: "https://placehold.co/400",
                description: "Description 4",
                price: currencyFormatter.format(40.99),
                title: "Title 4",
            },
        ],
        correctedText: searchId.includes("raw") ? "" : "corrected text",
        rawText: "raw text",
    };
    return mockData;

    const response = await fetch(`/api/search-results/${searchId}`);

    if (!response.ok) {
        throw new Error("Failed to get results.");
    }

    const data: { products: Product[]; correctedText: string; rawText: string } = await response.json();
    return data;
};

export const getRawTextResults = async (searchId: string) => {
    // Mock api call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "raw text " + searchId;
};

export const fetchProductById = async (productId: string): Promise<Product> => {
    // MOCK DATA
    await new Promise((res) => setTimeout(res, 1000)); // Simulate network delay

    const allProducts: Product[] = [
        {
            id: "1",
            name: "Product 1",
            imageUrl: "https://placehold.co/400",
            description: "Description 1",
            price: currencyFormatter.format(10.99),
            title: "Title 1",
        },
        {
            id: "2",
            name: "Product 2",
            imageUrl: "https://placehold.co/400",
            description: "Description 2",
            price: currencyFormatter.format(20.97),
            title: "Title 2",
        },
        {
            id: "3",
            name: "Product 3",
            imageUrl: "https://placehold.co/400",
            description: "Description 3",
            price: currencyFormatter.format(30.5),
            title: "Title 3",
        },
        {
            id: "4",
            name: "Product 4",
            imageUrl: "https://placehold.co/400",
            description: "Description 4",
            price: currencyFormatter.format(40.99),
            title: "Title 4",
        },
    ];
    const product = allProducts.find((p) => p.id === productId);

    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};
