// Ensure popup has rounded corners
document.documentElement.style.borderRadius = "20px";
document.documentElement.style.overflow = "hidden";
document.body.style.borderRadius = "20px";
document.body.style.overflow = "hidden";
document.body.setAttribute("data-extension-popup", "true");

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const pageImagesContainer = document.getElementById("pageImages");

let imageBytes = null;
let imageMimeType = "image/png";
let selectedPageImage = null;

function selectPageImage(image, element) {
  document.querySelectorAll(".page-image-item").forEach((item) => {
    item.classList.remove("selected");
  });

  element.classList.add("selected");
  selectedPageImage = image;

  updateSendButtonState();
}

function updateSendButtonState() {
  sendBtn.disabled = !(imageBytes && selectedPageImage);
}

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) {
    imageBytes = null;
    preview.style.display = "none";
    preview.parentElement.classList.remove("show");
    updateSendButtonState();
    return;
  }

  imageMimeType = file.type || "image/png";
  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result;
    imageBytes = new Uint8Array(arrayBuffer);
  };
  reader.readAsArrayBuffer(file);

  const urlReader = new FileReader();
  urlReader.onload = () => {
    preview.src = urlReader.result;
    preview.style.display = "block";
    preview.parentElement.classList.add("show");
  };
  urlReader.readAsDataURL(file);

  updateSendButtonState();
});

sendBtn.addEventListener("click", async () => {
  if (!imageBytes || !selectedPageImage) return;

  statusEl.textContent =
    "Downloading outfit image and sending to AI...";
  resultEl.textContent = "";
  resultEl.classList.remove("show");
  sendBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const imageResponse = await chrome.tabs.sendMessage(tab.id, {
      action: "DOWNLOAD_IMAGE",
      imageUrl: selectedPageImage.src,
    });

    if (!imageResponse.success) {
      throw new Error("Failed to download outfit image");
    }

    const response = await chrome.runtime.sendMessage({
      type: "SEND_IMAGE_TO_LLM",
      payload: {
        bytes: Array.from(imageBytes),
        mimeType: imageMimeType,
        outfitBase64: imageResponse.base64,
        outfitMimeType: imageResponse.mimeType,
        prompt: "Try this outfit on me",
      },
    });

    if (response && response.ok) {
      resultEl.textContent = response.data;
      resultEl.classList.add("show");
      statusEl.textContent = "Done!";
    } else {
      throw new Error(response?.error || "Unknown error");
    }
  } catch (err) {
    statusEl.textContent = "Failed";
    resultEl.textContent = String(err);
    resultEl.classList.add("show");
  } finally {
    sendBtn.disabled = false;
  }
});

document
  .getElementById("getImage")
  .addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("Sending message to content script in tab:", tab.id);

    chrome.tabs.sendMessage(
      tab.id,
      { action: "getImage" },
      (response) => {
        console.log("Response received:", response);
        if (chrome.runtime.lastError) {
          console.error(
            "Messaging failed:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("Image URL:", response?.imgUrl);
        }
      }
    );
  });
