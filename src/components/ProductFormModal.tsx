import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaGallery, type UploadedImage } from "./MediaGallery";
import { CascadingSelector } from "./CascadingSelector";
import {
    createProduct,
    updateProduct,
    fetchCatagories,
    fetchBrands,
    fetchProductImages,
    type Product,
    type CreateProductInput,
} from "../lib/api";
import { Modal } from "./ui/Modal";

// UI Components
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { Combobox } from "./ui/Combobox";

// --- Types & Interfaces ---
interface ProductFormData {
    name: string;
    price: string;
    description: string;
}

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!product;

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
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    // --- Queries ---
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

    // --- Populate Form Data on Edit ---
    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                name: product.name,
                price: product.price.toString(),
                description: product.description,
            });

            // Brand and Category
            setBrandName(product.brand.name);
            setSelectedSubcategoryId(product.categories[1]?.category_id || null);
            setSelectedCategoryId(product.categories[0]?.category_id || null);

            // Images - Convert URLs to Files to keep MediaGallery happy
            const fetchImages = async () => {
                setIsLoadingImages(true);
                try {
                    const { images: fetchedImages } = await fetchProductImages(product.product_id);
                    const imagePromises = fetchedImages.map(async (img) => {
                        const url = img.image;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const fileName = url.split("/").pop() || "image.webp";
                        const file = new File([blob], fileName, { type: blob.type });
                        return {
                            file,
                            id: crypto.randomUUID(),
                            preview: url,
                        } as UploadedImage;
                    });
                    const loadedImages = await Promise.all(imagePromises);
                    setImages(loadedImages);
                } catch (error) {
                    console.error("Failed to load existing images", error);
                } finally {
                    setIsLoadingImages(false);
                }
            };
            fetchImages();
        } else if (isOpen && !product) {
            // Reset form for Add mode
            setFormData({ name: "", price: "", description: "" });
            setBrandName("");
            setSelectedCategoryId(null);
            setSelectedSubcategoryId(null);
            setImages([]);
        }
    }, [isOpen, product]);

    // --- Mutations ---
    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh list
            onClose();
            alert("Product created successfully!");
        },
        onError: (error) => {
            alert("Failed to create product: " + error.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateProductInput) => updateProduct(product!.product_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh list
            onClose();
            alert("Product updated successfully!");
        },
        onError: (error) => {
            alert("Failed to update product: " + error.message);
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
            alert("Please fill all fields, and upload at least one image.");
            return;
        }

        // Image Conversion Logic
        const convertImageToWebP = (file: File): Promise<File> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const MAX_SIZE = 1080;
                    let { width, height } = img;

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
                            if (!blob) return reject(new Error("Canvas to Blob conversion failed"));
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

        const payload = {
            name: formData.name,
            price: Number(formData.price),
            description: formData.description,
            brand: brandName,
            category_ids: [selectedCategoryId, selectedSubcategoryId],
            images: convertedImages,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Edit Product" : "Add New Product"}
            className="h-[90vh] w-[90vw] max-w-7xl"
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isPending || isLoadingImages} form="product-form">
                        {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Publish Product"}
                    </Button>
                </div>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* --- LEFT COLUMN --- */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Product Information */}
                        <Card className="overflow-visible border-gray-200">
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
                        {isLoadingImages ? (
                            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                                <span className="text-gray-400">Loading images...</span>
                            </div>
                        ) : (
                            <MediaGallery images={images} onImagesChange={setImages} />
                        )}
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="lg:col-span-1">
                        <CascadingSelector
                            className="max-h-[720px]"
                            selectedCategoryId={selectedCategoryId}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onCategorySelect={handleCategorySelect}
                            onSubcategorySelect={setSelectedSubcategoryId}
                            categories={categories}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
