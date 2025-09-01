document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");

  let imageBytes = null;
  let imageMimeType = "image/png";
  let imageBase64 = null;

  chrome.storage.local.get(["uploadedImage", "mimeType"], (res) => {
    if (res.uploadedImage && res.mimeType) {
      preview.src = `data:${res.mimeType};base64,${res.uploadedImage}`;
      preview.style.display = "block";
      preview.parentElement.classList.add("show");
    } else {
      preview.alt = "No preview available";
      preview.style.display = "none";
      preview.parentElement.classList.remove("show");
    }
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      imageBytes = null;
      imageBase64 = null;
      imageMimeType = null;
      preview.style.display = "none";
      preview.parentElement.classList.remove("show");
      chrome.storage.local.remove(["uploadedImage", "mimeType"]);
      return;
    }

    imageMimeType = file.type || "image/png";

    const reader = new FileReader();
    reader.onloadend = () => {
      imageBytes = new Uint8Array(reader.result);
    };
    reader.readAsArrayBuffer(file);

    const urlReader = new FileReader();
    urlReader.onload = () => {
      const dataUrl = urlReader.result;
      preview.src = dataUrl;
      preview.style.display = "block";
      preview.parentElement.classList.add("show");

      imageBase64 = dataUrl.split(",")?.[1];

      chrome.storage.local.set({
        uploadedImage: imageBase64,
        mimeType: file.type,
      });
    };
    urlReader.readAsDataURL(file);
  });
});
