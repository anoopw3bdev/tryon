const API_KEY = "AIzaSyCGIFZLNeeodCTvENAz8b-thLNBGRLI0Q8";
const MODEL = "gemini-2.5-flash-image-preview";

async function callGemini({
  API_KEY,
  MODEL,
  userImageBase64,
  userImageMimeType,
  imageFromPage,
  imageMimeTypeFromPage,
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const parts = [
    {
      text: `From Image 1, use the exact clothing, including its specific fit type (e.g., loose, baggy, oversized, tailored, slim-fit), its volume, drape, color, and pattern. From Image 2, use the exact person, including their face, body shape, pose, and every aspect of their physical appearance. Also, use the exact background, environment, lighting, and overall composition from Image 2.

      Seamlessly merge the clothing from Image 1 onto the person in Image 2. The new outfit must appear as a genuine, unedited photograph of the person in Image 2 wearing the new clothes.

      Ensure the clothing realistically drapes and conforms to the person's body and pose, with natural folds, wrinkles, and shadows that are consistent with the fabric type and the lighting in Image 2. Crucially, the new clothing must maintain its original volume and fitting style as seen in Image 1, not conforming unnaturally tightly to the body in Image 2 if it was originally a looser fit. The lighting and shadows on the clothing must match the ambient lighting of the background in Image 2. Do not introduce any new light sources or colors.

      Preserve the sharpness, detail, and resolution of the original person and background in Image 2. The final result should not be blurry, smoothed, or reduced in quality. The body's proportions must remain normal and realistic without any distortion or awkward appearance.

      The final output should be a single, cohesive, photorealistic image that looks like a high-quality photograph taken in one shot. Consider every request as new and dont take any reference from the previous images. If models in the first image are wearing multiple clothes, use the outermost layer of clothing for the try-on. If the models are tunring or not facing the camera, ensure the final image shows the person facing the camera directly. End result should be strictly a single image, that looks like a high-quality photograph taken in one shot.`,
    },
    {
      inline_data: {
        mimeType: imageMimeTypeFromPage || "image/png",
        data: imageFromPage,
      },
    },
    {
      inline_data: {
        mime_type: userImageMimeType || "image/png",
        data: userImageBase64,
      },
    },
  ];

  const body = {
    contents: [
      {
        parts: parts,
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const json = await res.json();
  const candidates = json.candidates || [];
  const inlineData =
    candidates[0]?.content?.parts?.find(
      (item) => "inlineData" in item
    )?.inlineData || {};

  return inlineData;
}

// Receive image from content script
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.action === "processImage") {
      chrome.storage.local.get(
        ["uploadedImage", "mimeType"],
        async (res) => {
          const { uploadedImage, mimeType } = res;

          try {
            const data = await callGemini({
              API_KEY,
              MODEL,
              userImageBase64: uploadedImage,
              uploadedMimeType: mimeType,
              imageFromPage: message.base64,
              imageMimeTypeFromPage: message.mimeType,
            });
            sendResponse({ ok: true, data });
          } catch (error) {
            sendResponse({ ok: false, error: String(error) });
          }
        }
      );

      return true;
    }
  }
);
