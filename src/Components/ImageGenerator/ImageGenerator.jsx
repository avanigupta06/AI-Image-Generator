import React, { useRef, useState } from 'react';
import './ImageGenerator.css';
import default_image from '../Assets/default_image.png';

const ImageGenerator = () => {
    const [image_url, setImage_url] = useState(default_image);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const imageGenerator = async () => {
        const prompt = inputRef.current.value.trim();
        if (!prompt) {
            console.error("Prompt is empty. Please enter a description.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
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
                const errorDetails = await response.json();
                console.error("Gemini API Error Response:", errorDetails);
                if (errorDetails && errorDetails.error && errorDetails.error.message) {
                    console.error("Detailed Gemini Error Message:", errorDetails.error.message);
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            const imagePart = result.candidates[0].content.parts.find(
                p => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('image/')
            );

            const base64Image = imagePart?.inlineData?.data;
            const returnedMimeType = imagePart?.inlineData?.mimeType;

            if (!base64Image || !returnedMimeType) {
                const textPart = result.candidates[0].content.parts.find(p => p.text);
                if (textPart) {
                    console.warn("API returned text but no image:", textPart.text);
                    // You might display this text to the user or handle it
                }
                setImage_url(default_image); // Revert to default or show a "no image" message
                throw new Error("No image data or MIME type found in the API response parts.");
            }

            const imageDataURL = `data:${returnedMimeType};base64,${base64Image}`;
            setImage_url(imageDataURL);
        } catch (error) {
            console.error("Error generating image:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='ai-image-generator'>
            <div className="header">AI Image <span>Generator</span></div>
            <div className="img-loading">
  <div className="image">
  <img src={image_url} alt="Generated visual" />
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