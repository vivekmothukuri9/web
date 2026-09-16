import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppProvider';
import { MessageSquare, Plus, Search, Library, Settings, MoreHorizontal, User, Sun, Moon, LogOut, Globe } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen, chats, createNewChat, selectChat, activeChat, setIsSearchOpen, setIsSettingsOpen, currentView, setCurrentView } = useContext(AppContext);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="app-logo">LA</div>
            <span className="app-name">Local AI</span>
          </div>
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-item ${currentView === 'chat' && !activeChat ? 'active' : ''}`} onClick={createNewChat}>
            <div className="nav-icon"><Plus size={16} /></div>
            <span>New Chat</span>
          </button>
          <button className="nav-item" onClick={() => setIsSearchOpen(true)}>
            <div className="nav-icon"><Search size={16} /></div>
            <span>Search</span>
          </button>
          <button className="nav-item">
            <div className="nav-icon"><Library size={16} /></div>
            <span>Library</span>
          </button>
          <button className={`nav-item ${currentView === 'web-sessions' ? 'active' : ''}`} onClick={() => setCurrentView('web-sessions')}>
            <div className="nav-icon"><Globe size={16} /></div>
            <span>Web Sessions</span>
          </button>
        </div>

        <div className="sidebar-history">
          {chats.filter(c => c.date === 'today').length > 0 && (
            <div className="history-section">
              <div className="history-title">Today</div>
              {chats.filter(c => c.date === 'today').map(chat => (
                <div 
                  key={chat.id} 
                  className={`history-item ${activeChat === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat.id)}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{chat.title}</span>
                  <button className="history-more"><MoreHorizontal size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {chats.filter(c => c.date === 'yesterday').length > 0 && (
            <div className="history-section">
              <div className="history-title">Yesterday</div>
              {chats.filter(c => c.date === 'yesterday').map(chat => (
                <div 
                  key={chat.id} 
                  className={`history-item ${activeChat === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat.id)}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{chat.title}</span>
                  <button className="history-more"><MoreHorizontal size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {chats.filter(c => c.date === 'week').length > 0 && (
            <div className="history-section">
              <div className="history-title">Previous 7 Days</div>
              {chats.filter(c => c.date === 'week').map(chat => (
                <div 
                  key={chat.id} 
                  className={`history-item ${activeChat === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat.id)}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{chat.title}</span>
                  <button className="history-more"><MoreHorizontal size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
            <div className="avatar"><User size={20} /></div>
            <div className="user-info">
              <span className="user-name">Vivek</span>
              <span className="user-type">Local Account</span>
            </div>
            <MoreHorizontal size={18} className="profile-more" />
          </div>
          
          {profileMenuOpen && (
            <div className="profile-menu">
              <button onClick={() => { setIsSettingsOpen(true); setProfileMenuOpen(false); }}>
                <Settings size={16} /> Settings
              </button>
              <button>
                <Sun size={16} /> Theme
              </button>
              <button>
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
