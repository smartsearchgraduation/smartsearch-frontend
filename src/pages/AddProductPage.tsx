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
    comparePrice: string;
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

const AddProductPage: React.FC = () => {
    // --- Form State ---
    const [formData, setFormData] = useState<ProductFormData>({
        title: "",
        price: "",
        comparePrice: "",
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
        <div className="min-h-screen bg-gray-100 py-6 px-2">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
                {/* --- Header Section --- */}
                <header className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Link
                        to="/"
                        className="flex gap-2 text-4xl font-bold text-gray-800 text-shadow-md outline-none cursor-pointer"
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-2 space-y-6">
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
                                            <span className="text-xs text-gray-400 font-bold">
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
                    <div className="lg:col-span-1 space-y-6">
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
                                    leftIcon={<span className="text-gray-500 font-bold text-lg">$</span>}
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
};

export default AddProductPage;
