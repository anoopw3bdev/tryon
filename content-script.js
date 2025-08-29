chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received in content script:", msg);

  if (msg.action === "getImage") {
    let img = document.querySelector(".css-kwk7lt");
    console.log("Image found:", img);
    sendResponse({ imgUrl: img?.src || null });
  }
});
