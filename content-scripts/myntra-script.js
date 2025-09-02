function injectButton() {
  const target = document.querySelector(".pdp-add-to-bag");
  if (!target) {
    console.log("Target element not found yet...");
    return;
  }

  if (document.getElementById("tryon-btn")) return;

  const btn = document.createElement("button");
  btn.id = "tryon-btn";
  btn.innerText = "Fit Check";
  btn.style.marginRight = "10px";
  btn.style.padding = "6px 16px";
  btn.style.border = "1px solid #000";
  btn.style.color = "black";
  btn.style.backgroundColor = "white";
  btn.style.cursor = "pointer";
  btn.style.whiteSpace = "nowrap";
  btn.style.fontWeight = "600";
  btn.style.fontSize = "16px";
  btn.style.position = "relative";

  // Add animated dots style
  const style = document.createElement("style");
  style.textContent = `
    @keyframes blink {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }
    .loading-dots span {
      animation: blink 1.4s infinite;
      margin-left: 2px;
    }
    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
  `;
  document.head.appendChild(style);

  btn.addEventListener("click", async () => {
    const firstCol = document.querySelector(
      ".image-grid-container > .image-grid-col50"
    );
    const firstImageDiv = firstCol?.querySelector(
      ".image-grid-image"
    );

    if (!firstImageDiv) {
      alert("No background image found!");
      return;
    }

    const style = firstImageDiv.style.backgroundImage;
    const imageUrl = style.slice(5, -2);

    // Show loader
    btn.innerHTML = `<div class="loading-dots">Loading<span>.</span><span>.</span><span>.</span></div>`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result.split(",")?.[1];
        const mimeType = blob.type;

        chrome.runtime.sendMessage(
          {
            action: "processImage",
            base64: base64Data,
            mimeType,
          },
          (response) => {
            btn.innerText = "Fit Check";

            if (response.ok) {
              updateModelImageInPage(response.data);
            } else {
              console.error(
                "❌ Error from background:",
                response.error
              );
            }
          }
        );
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      btn.innerText = "Fit Check";
      console.error("Failed to fetch image:", err);
    }
  });

  target.insertAdjacentElement("afterend", btn);
}

injectButton();

function updateModelImageInPage(data) {
  const firstCol = document.querySelector(
    ".image-grid-container > .image-grid-col50"
  );
  const firstImageDiv = firstCol?.querySelector(".image-grid-image");
  if (!firstImageDiv) return;

  const responseMimeType = data?.mimeType || "image/png";
  const responseBase64 = data?.data;
  if (!responseBase64) return;

  firstImageDiv.style.backgroundImage = `url("data:${responseMimeType};base64,${responseBase64}")`;
}
