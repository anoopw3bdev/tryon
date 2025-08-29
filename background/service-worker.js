async function fetchSettings() {
  const { llmSettings } = await chrome.storage.sync.get(
    "llmSettings"
  );
  if (!llmSettings || !llmSettings.apiKey || !llmSettings.model) {
    throw new Error(
      "Missing API key or model. Configure in Options."
    );
  }
  return llmSettings;
}

async function callGemini({
  apiKey,
  model,
  prompt,
  imageBytes,
  mimeType,
  outfitBase64,
  outfitMimeType,
}) {
  // Convert user's photo to base64
  const userPhotoBase64 = btoa(String.fromCharCode(...imageBytes));

  // Gemini 1.5 multimodal via REST - send both images
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const parts = [
    { text: prompt || "Try this outfit on me" },
    {
      inline_data: {
        mime_type: mimeType || "image/png",
        data: userPhotoBase64,
      },
    },
  ];

  // Add outfit image if provided
  if (outfitBase64) {
    parts.push({
      inline_data: {
        mime_type: outfitMimeType || "image/jpeg",
        data: outfitBase64,
      },
    });
  }

  const body = {
    contents: [
      {
        parts: parts,
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const json = await res.json();
  const candidates = json.candidates || [];
  const text =
    candidates[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return text;
}

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    (async () => {
      if (message?.type === "SEND_IMAGE_TO_LLM") {
        try {
          const settings = await fetchSettings();
          const { apiKey, model } = settings;
          const {
            bytes,
            prompt,
            mimeType,
            outfitBase64,
            outfitMimeType,
          } = message.payload;
          const data = await callGemini({
            apiKey,
            model,
            prompt,
            imageBytes: bytes,
            mimeType,
            outfitBase64,
            outfitMimeType,
          });
          sendResponse({ ok: true, data });
        } catch (error) {
          sendResponse({ ok: false, error: String(error) });
        }
      }
    })();
    return true;
  }
);
