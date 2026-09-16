import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppProvider';
import { X } from 'lucide-react';
import './Modal.css';

const KeyboardShortcutsModal = () => {
  const { isShortcutsOpen, setIsShortcutsOpen, setIsSearchOpen, createNewChat } = useContext(AppContext);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl/Cmd + Shift + O for New Chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        createNewChat();
      }
      
      // Ctrl/Cmd + K for Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Ctrl/Cmd + / for Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      
      // Esc to close modals
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [createNewChat, setIsSearchOpen, setIsShortcutsOpen]);

  if (!isShortcutsOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsShortcutsOpen(false)}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Keyboard shortcuts</h2>
          <button className="close-btn" onClick={() => setIsShortcutsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="shortcut-row">
            <span>New chat</span>
            <div className="shortcut-keys">
              <span className="key">Ctrl</span>
              <span className="key">Shift</span>
              <span className="key">O</span>
            </div>
          </div>
          <div className="shortcut-row">
            <span>Search</span>
            <div className="shortcut-keys">
              <span className="key">Ctrl</span>
              <span className="key">K</span>
            </div>
          </div>
          <div className="shortcut-row">
            <span>Send message</span>
            <div className="shortcut-keys">
              <span className="key">Enter</span>
            </div>
          </div>
          <div className="shortcut-row">
            <span>New line</span>
            <div className="shortcut-keys">
              <span className="key">Shift</span>
              <span className="key">Enter</span>
            </div>
          </div>
          <div className="shortcut-row">
            <span>Close modal</span>
            <div className="shortcut-keys">
              <span className="key">Esc</span>
            </div>
          </div>
          <div className="shortcut-row">
            <span>Open shortcuts</span>
            <div className="shortcut-keys">
              <span className="key">Ctrl</span>
              <span className="key">/</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
