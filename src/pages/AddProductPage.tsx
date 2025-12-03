import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MediaGallery, type UploadedImage } from "../components/MediaGallery";
import { CascadingSelector } from "../components/CascadingSelector";
import { createProduct, fetchCatagories } from "../lib/api";

// UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader } from "../components/ui/Card";

// --- Types & Interfaces ---
interface ProductFormData {
    title: string;
    price: string;
    description: string;
}

function AddProductPage() {
    const navigate = useNavigate();

    // --- Form State ---
    const [formData, setFormData] = useState<ProductFormData>({
        title: "",
        price: "",
        description: "",
    });

    // Categorization State
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

    // Image State
    const [images, setImages] = useState<UploadedImage[]>([]);

    // --- Queries & Mutations ---
    const { data } = useQuery({
        queryKey: ["catagories"],
        queryFn: fetchCatagories,
    });
    const categories = data?.categories || [];

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // Show success message
            alert("Product created successfully!");
        },
        onError: (error) => {
            alert("Failed to create product: " + error.message);
        },
    });

    // --- Handlers: Text Inputs ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Handlers: Categorization ---
    const handleCategorySelect = (id: number) => {
        if (selectedCategoryId === id) return;
        setSelectedCategoryId(id);
        setSelectedSubcategoryId(null);
    };

    // --- Handler: Submit ---
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Ensure required fields are present (though button is disabled otherwise)
        if (!selectedCategoryId || !selectedSubcategoryId || images.length === 0) {
            return;
        }

        mutation.mutate({
            ...formData,
            category_id: selectedCategoryId,
            subcategory_id: selectedSubcategoryId,
            images: images.map((i) => i.preview), // Using preview URL as placeholder for now
        });
    };

    const handleDiscard = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 px-2 py-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
                {/* --- Header Section --- */}
                <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex gap-2">
                        <Link
                            to="/"
                            className="flex cursor-pointer gap-2 text-4xl font-bold text-gray-800 outline-none text-shadow-md"
                        >
                            <span className="text-emerald-600">Smart </span>
                            <span className="text-gray-800">Search</span>
                        </Link>
                        <span className="text-4xl font-bold text-gray-600"> | </span>
                        <span className="mt-auto text-2xl font-bold text-gray-600">Admin</span>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={handleDiscard}>
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={
                                !formData.title || !selectedSubcategoryId || images.length === 0 || mutation.isPending
                            }
                        >
                            {mutation.isPending ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* --- LEFT COLUMN --- */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. Product Information */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-gray-800">Product Information</h2>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Title */}
                                <Input
                                    label="Product Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Vintage Leather Jacket"
                                />

                                {/* Description */}
                                <Textarea
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={6}
                                    placeholder="Describe your product using natural language..."
                                    footer={
                                        <div className="flex justify-end">
                                            <span className="text-xs font-bold text-gray-400">
                                                {formData.description.length} chars
                                            </span>
                                        </div>
                                    }
                                />
                            </CardContent>
                        </Card>

                        {/* 2. Media Gallery */}
                        <MediaGallery images={images} onImagesChange={setImages} />
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* 3. Pricing */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-gray-800">Pricing</h2>
                            </CardHeader>
                            <CardContent className="flex flex-col">
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    leftIcon={<span className="text-lg font-bold text-gray-500">$</span>}
                                />
                            </CardContent>
                        </Card>

                        {/* 4. Organization */}
                        <CascadingSelector
                            selectedCategoryId={selectedCategoryId}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onCategorySelect={handleCategorySelect}
                            onSubcategorySelect={setSelectedSubcategoryId}
                            categories={categories}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddProductPage;
