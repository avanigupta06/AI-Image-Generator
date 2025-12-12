import React, { useRef, useState } from 'react';
import './ImageGenerator.css';
import default_image from '../Assets/default_image.png';

const ImageGenerator = () => {
    const [image_url, setImage_url] = useState(default_image);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const imageGenerator = async () => {
        const prompt = inputRef.current.value.trim();
        if (!prompt) {
            console.error("Prompt is empty. Please enter a description.");
            setError("Please enter a description for the image.");
            return;
        }

        if (!process.env.REACT_APP_GEMINI_API_KEY) {
            console.error("API key is missing!");
            setError("API key is not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }]
                            }
                        ],
                        generationConfig: {
                            // *** CRITICAL CHANGE: REMOVE THIS LINE! ***
                            // responseMimeType: "application/json",
                            responseModalities: ["TEXT", "IMAGE"] // Keep this, as it's required for image output
                        }
                    })
                }
            );

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status}`;
                try {
                    const errorDetails = await response.json();
                    console.error("Gemini API Error Response:", errorDetails);
                    if (errorDetails && errorDetails.error) {
                        if (errorDetails.error.message) {
                            errorMessage = errorDetails.error.message;
                            console.error("Detailed Gemini Error Message:", errorMessage);
                        }
                        if (errorDetails.error.status) {
                            errorMessage += ` (${errorDetails.error.status})`;
                        }
                    }
                } catch (parseError) {
                    console.error("Could not parse error response:", parseError);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Full API Response:", result);
            
            // Check if we have candidates
            if (!result.candidates || !result.candidates[0]) {
                console.error("No candidates in response:", result);
                throw new Error("No candidates found in API response");
            }

            // Check if we have content
            if (!result.candidates[0].content || !result.candidates[0].content.parts) {
                console.error("No content parts in response:", result.candidates[0]);
                throw new Error("No content parts found in API response");
            }

            console.log("Content parts:", result.candidates[0].content.parts);

            // Find the image part
            const imagePart = result.candidates[0].content.parts.find(
                p => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/')
            );

            console.log("Found image part:", imagePart ? "Yes" : "No");

            if (!imagePart) {
                // Log all parts to see what we got
                result.candidates[0].content.parts.forEach((part, index) => {
                    console.log(`Part ${index}:`, Object.keys(part));
                });
                const textPart = result.candidates[0].content.parts.find(p => p.text);
                if (textPart) {
                    console.warn("API returned text but no image:", textPart.text);
                }
                throw new Error("No image data found in the API response parts.");
            }

            const base64Image = imagePart.inlineData?.data;
            const returnedMimeType = imagePart.inlineData?.mimeType;

            console.log("Image MIME type:", returnedMimeType);
            console.log("Image data length:", base64Image ? base64Image.length : 0);

            if (!base64Image || !returnedMimeType) {
                console.error("Missing image data or MIME type");
                throw new Error("No image data or MIME type found in the API response parts.");
            }

            const imageDataURL = `data:${returnedMimeType};base64,${base64Image}`;
            console.log("Setting image URL, length:", imageDataURL.length);
            setImage_url(imageDataURL);
        } catch (error) {
            console.error("Error generating image:", error.message);
            setError(`Failed to generate image: ${error.message}. Please check the console for details.`);
            setImage_url(default_image);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='ai-image-generator'>
            <div className="header">AI Image <span>Generator</span></div>
            <div className="img-loading">
                {error && (
                    <div style={{ 
                        color: '#ff6b6b', 
                        backgroundColor: '#ffe0e0', 
                        padding: '10px 20px', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        maxWidth: '512px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                <div className="image">
                    <img 
                        src={image_url} 
                        alt="Generated visual" 
                        onError={(e) => {
                            console.error("Image failed to load:", image_url);
                            if (image_url !== default_image) {
                                setError("Failed to load the generated image. Please try again.");
                            }
                            e.target.src = default_image;
                        }}
                    />
                </div>

                {image_url !== default_image && (
                    <div className="download-container">
                        <a href={image_url} download="generated_image.png">
                            <button className="download-btn">Download Image</button>
                        </a>
                    </div>
                )}

                <div className="loading">
                    <div className={loading ? "loading-bar-full" : "loading-bar"}></div>
                    <div className={loading ? "loading-text-full" : "loading-text"}>Loading....</div>
                </div>
            </div>

            <div className="search-box">
                <input type="text" ref={inputRef} className='search-input' placeholder='Describe what you want to see' />
                <div className="generator-btn" onClick={imageGenerator}>Generate</div>
            </div>
        </div>
    );
};

export default ImageGenerator;