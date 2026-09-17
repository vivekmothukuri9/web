// Listen for the special summarize flag in URL
if (window.location.search.includes('summarize=true')) {
  chrome.storage.local.get(['pendingScreenshot'], (res) => {
    if (res.pendingScreenshot) {
      // Send message to the React App via window.postMessage
      setTimeout(() => {
        window.postMessage({
          type: "GRASP_AI_INJECT_SCREENSHOT",
          dataUrl: res.pendingScreenshot
        }, "*");
        // Clear storage after use
        chrome.storage.local.remove('pendingScreenshot');
      }, 2000); // Wait for app to load
    }
  });
}