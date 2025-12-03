export interface TaxonomyType {
    [key: string]: string[];
}

export interface ProductFormData {
    title: string;
    price: string;
    comparePrice: string;
    description: string;
    status: string;
}

export interface UploadedImage {
    file: File;
    id: string;
    preview: string;
}

export const TAXONOMY_DATA: TaxonomyType = {
    Engineering: ["Frontend", "Backend", "DevOps", "Mobile", "QA"],
    Design: ["UI Design", "UX Research", "Graphic Design", "Motion"],
    Marketing: ["SEO", "Content", "Social Media", "Email"],
    Product: ["Roadmap", "Specs", "User Research", "Analytics"],
    Clothing: ["T-Shirts", "Jeans", "Jackets", "Shoes"],
    Home: ["Decor", "Kitchen", "Bedding", "Lighting"],
};
