import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MediaGallery, type UploadedImage } from "../components/MediaGallery";
import { CascadingSelector } from "../components/CascadingSelector";

// UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader } from "../components/ui/Card";

// --- Types & Interfaces ---
interface TaxonomyType {
    [key: string]: string[];
}

interface ProductFormData {
    title: string;
    price: string;
    description: string;
}

// --- Constants & Data ---
const TAXONOMY: TaxonomyType = {
    Engineering: ["Frontend", "Backend", "DevOps", "Mobile", "QA"],
    Design: ["UI Design", "UX Research", "Graphic Design", "Motion", "Branding"],
    Marketing: ["SEO", "Content", "Social Media", "Email", "Research"],
    Product: ["Roadmap", "Specs", "User Research", "Analytics"],
    Clothing: ["T-Shirts", "Jeans", "Jackets", "Shoes", "Accessories"],
    Home: ["Decor", "Kitchen", "Bedding", "Lighting", "Furniture"],
};

function AddProductPage() {
    // --- Form State ---
    const [formData, setFormData] = useState<ProductFormData>({
        title: "",
        price: "",
        description: "",
    });

    // Categorization State
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedSubtag, setSelectedSubtag] = useState<string | null>(null);

    // Image State
    const [images, setImages] = useState<UploadedImage[]>([]);

    // --- Handlers: Text Inputs ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Handlers: Categorization ---
    const handleTagSelect = (tag: string) => {
        if (selectedTag === tag) return;
        setSelectedTag(tag);
        setSelectedSubtag(null);
    };

    // --- Handler: Submit ---
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Submitting Product:", {
            ...formData,
            category: selectedTag,
            subcategory: selectedSubtag,
            images: images.map((i) => i.file.name),
        });
        alert("Product saved! Check console for data object.");
    };

    return (
        <div className="min-h-screen bg-gray-100 px-2 py-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
                {/* --- Header Section --- */}
                <header className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <Link
                        to="/"
                        className="flex cursor-pointer gap-2 text-4xl font-bold text-gray-800 outline-none text-shadow-md"
                    >
                        <span className="text-emerald-600">Smart </span>
                        <span className="text-gray-800">Search</span>
                    </Link>

                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => console.log("Discard clicked")}>
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!formData.title || !selectedSubtag || images.length === 0}
                        >
                            Publish
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
                            selectedTag={selectedTag}
                            selectedSubtag={selectedSubtag}
                            onTagSelect={handleTagSelect}
                            onSubtagSelect={setSelectedSubtag}
                            Data={TAXONOMY}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddProductPage;
