# 📸 AI Image Generator using Gemini API

A simple React-based web app that generates images from text prompts using **Google's Gemini 2.0 Flash Preview Image Generation API**. Includes modern UI and the ability to download generated images.

---

## 🚀 Features

- 🧠 Text-to-Image Generation via Gemini 2.0 Flash API  
- 📥 Download Generated Images in PNG format  
- 🎨 Clean, Responsive UI using Flexbox  
- ❌ Graceful handling of empty input and API errors  
- 🖼️ Default placeholder image before generation  
- 📱 Mobile-friendly

---

## 🧰 Tech Stack

- **Frontend:** React
- **API:** Google Gemini API (`gemini-2.0-flash-preview-image-generation`)
- **Environment:** Node.js

---

## 🖼️ Demo

![1](https://github.com/user-attachments/assets/6f75d1b8-492d-4047-bbc5-ab60cc94d320)


---


## 🧪 How It Works

- User enters a prompt in the input box.
- The app calls Gemini API and receives a base64 image.
- Image is rendered in the UI with a download button.

---

## ⚙️ Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app)
2. Create a Google Cloud Project.
3. Enable **Generative Language API** from the Cloud Console.
4. Generate an API key.
5. Add your key to a `.env` file:
    ```
    REACT_APP_GEMINI_API_KEY=your-key-here
    ```

> ✅ The free tier includes 1500 requests/day.

---

## 🔮 Future Features

- [ ] Voice Prompt Input (Speech-to-Text)
- [ ] Image Gallery for history
- [ ] Prompt History and Regenerate option
- [ ] Multiple image resolutions (256px, 512px, 1024px)
- [ ] Dark Mode Toggle 🌙

---

