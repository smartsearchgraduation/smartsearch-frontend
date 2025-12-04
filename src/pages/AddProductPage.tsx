import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MediaGallery, type UploadedImage } from "../components/MediaGallery";
import { CascadingSelector } from "../components/CascadingSelector";
import { createProduct, fetchCatagories, fetchBrands } from "../lib/api";

// UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Combobox } from "../components/ui/Combobox";

// --- Types & Interfaces ---
interface ProductFormData {
    name: string;
    price: string;
    description: string;
}

function AddProductPage() {
    const navigate = useNavigate();

    // --- Form State ---
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        price: "",
        description: "",
    });

    // Categorization State
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

    // Brand State
    const [brandName, setBrandName] = useState<string>("");

    // Image State
    const [images, setImages] = useState<UploadedImage[]>([]);

    // --- Queries & Mutations ---
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCatagories,
    });
    const categories = categoriesData?.categories || [];

    const { data: brandsData } = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrands,
    });
    const brands = brandsData || [];
    const brandOptions = brands.map((b) => ({
        value: b.brand_id,
        label: b.name,
    }));

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
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Ensure required fields are present
        if (!selectedCategoryId || !selectedSubcategoryId || images.length === 0 || !brandName.trim()) {
            alert("Please fill all fields, enter a brand, and upload at least one image.");
            return;
        }

        const convertImageToWebP = (file: File): Promise<File> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const MAX_SIZE = 1080;
                    let { width, height } = img;

                    // Maintain aspect ratio while resizing
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject(new Error("Failed to get canvas context"));
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                return reject(new Error("Canvas to Blob conversion failed"));
                            }
                            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                                type: "image/webp",
                            });
                            resolve(webpFile);
                        },
                        "image/webp",
                        0.96,
                    );
                };
                img.onerror = (err) => reject(err);
            });
        };

        const convertedImages = await Promise.all(images.map((i) => convertImageToWebP(i.file)));

        mutation.mutate({
            name: formData.name,
            price: Number(formData.price),
            description: formData.description,
            brand: brandName, // Use the string directly
            category_ids: [selectedCategoryId, selectedSubcategoryId],
            images: convertedImages,
        });
    };

    const handleDiscard = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 px-2 py-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
                {/* --- Header Section --- */}
                <header className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
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
                </header>

                <div className="flex items-center justify-between px-2">
                    <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>

                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={handleDiscard}>
                            Discard
                        </Button>
                        <Button type="submit" variant="primary">
                            {mutation.isPending ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* --- LEFT COLUMN --- */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Product Information */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-gray-800">Product Information</h2>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Title */}
                                <Input
                                    label="Product Title"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Vintage Leather Jacket"
                                />

                                {/* Description */}
                                <Textarea
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Describe your product using natural language..."
                                    footer={
                                        <div className="flex justify-end">
                                            <span className="text-xs font-bold text-gray-400">
                                                {formData.description.length} chars
                                            </span>
                                        </div>
                                    }
                                />

                                {/* Pricing and Brand */}
                                <div className="flex items-center justify-between gap-4">
                                    <Combobox
                                        label="Brand"
                                        options={brandOptions}
                                        value={brandName}
                                        onChange={setBrandName}
                                        placeholder="Select or type a brand..."
                                    />
                                    <Input
                                        label="Price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        leftIcon={<span className="text-lg font-bold text-gray-500">$</span>}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Gallery */}
                        <MediaGallery images={images} onImagesChange={setImages} />
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Categories */}
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
