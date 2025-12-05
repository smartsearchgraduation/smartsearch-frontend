import React, { useState } from "react";

interface ImageResult {
    id: number;
    content: string;
    alt: string;
}

const ImageStreamGallery = () => {
    const [images, setImages] = useState<ImageResult[]>([]);
    const [loading, setLoading] = useState(false);

    const startSearch = async () => {
        setImages([]); // Clear previous results
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:5000/stream-search-images");
            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 1. Decode the raw bytes to string and add to buffer
                buffer += decoder.decode(value, { stream: true });

                // 2. Split buffer by newline
                const lines = buffer.split("\n");

                // 3. The last item in 'lines' might be an incomplete JSON chunk
                // Save it back to the buffer and process the rest.
                buffer = lines.pop() || "";

                // 4. Parse complete lines
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const newImage = JSON.parse(line);

                            // 5. Update state instantly!
                            setImages((prev) => [...prev, newImage]);
                        } catch (e) {
                            console.error("Error parsing JSON chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Stream error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <button onClick={startSearch} disabled={loading}>
                {loading ? "Searching..." : "Start Search"}
            </button>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
                {images.map((img) => (
                    <div key={img.id} style={{ border: "1px solid #ddd", padding: "5px" }}>
                        <img src={img.content} alt={img.alt} style={{ width: "150px", height: "150px" }} />
                        <p style={{ textAlign: "center" }}>{img.alt}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageStreamGallery;
