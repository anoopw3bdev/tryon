# AI Outfit Fit Check Chrome Extension

This project is a Chrome extension that lets users try new outfits on a person using the **Nano Banana API**. Upload **one image** and the AI generates a **photorealistic result** where only the clothing is changed, while the **face, pose, body, and background remain untouched**.

---

## ✨ Features

- 📸 Upload a single photo
- 👕 Replace only the **clothing** while keeping everything else unchanged
- ⚡ One-click **Fit Check** button
- 👀 Preview AI-generated results directly in the extension popup

---

## Platforms supported currently

1. Nykaa
2. Myntra
3. More platforms coming soon...

## 🚀 Setup Instructions

1.  **Clone this repository**

    ```bash
    git clone [https://github.com/anoopw3bdev/tryon.git](https://github.com/anoopw3bdev/tryon.git)
    cd tryon
    ```

2.  **Add your API key**
    Open the file `service-worker.js` and set your Nano Banana API key:

    ```js
    const API_KEY = "replace this with your API key";
    
    ```
    Steps to get your API KEY.

    - Go to Google AI Studio (https://aistudio.google.com/apikey).
    - Log in with your Google Account.
    - Look for and click the “Get API Key” button (usually in the dashboard or main menu).
    - Click “Create API Key.”
    - If prompted, select an existing Google Cloud project or create a new one.

    > ⚠️ **Warning**  
    > Please note that the free-tier API may not always work as expected.  
    > You might need to use the free credits provided by google cloud.


4.  **Load the extension in Chrome**

    - Open Chrome and go to `chrome://extensions/`
    - Turn on **Developer mode**
    - Click **Load unpacked**
    - Select the project folder (where `manifest.json` is located)

5.  **Use the extension**
    - Click the "AI Outfit Fit Check" icon in the Chrome toolbar
    - Upload your photo
    - Click "Fit Check"
    - View your generated outfit in the popup 🎉

---

## 🛠 Development Notes

- Uses a service worker for API requests
- Sends image data as base64 to the Nano Banana API
- Outfit replacement prompt is inside `service-worker.js`

---

## 🐞 Troubleshooting

- Check logs at `chrome://extensions/` → click `background page`
- Verify your API key is correct
- Use clear, high-resolution images for best results
