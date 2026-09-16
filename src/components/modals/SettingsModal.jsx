import React, { useContext } from 'react';
import { AppContext } from '../../context/AppProvider';
import { X } from 'lucide-react';
import './Modal.css';

const SettingsModal = () => {
  const { isSettingsOpen, setIsSettingsOpen, theme, setTheme } = useContext(AppContext);

  if (!isSettingsOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="settings-section">
            <h3>General</h3>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Theme</span>
                <span className="setting-desc">Choose your preferred appearance</span>
              </div>
              <div className="setting-control">
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Language</span>
                <span className="setting-desc">Interface language</span>
              </div>
              <div className="setting-control">
                <select>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Chat</h3>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Show Code Line Numbers</span>
                <span className="setting-desc">Display line numbers in code blocks</span>
              </div>
              <div className="setting-control">
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Data</h3>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Clear all chats</span>
                <span className="setting-desc">Delete all local conversation history</span>
              </div>
              <div className="setting-control">
                <button className="btn-danger">Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
