import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppProvider';
import { MessageSquare, Plus, Search, Settings, MoreHorizontal, User, LogOut, Trash2, Edit2, Check, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen, chats, createNewChat, selectChat, activeChat, setIsSearchOpen, deleteChat, renameChat } = useContext(AppContext);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!isSidebarOpen) return null;

  const handleRenameStart = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setActiveMenuId(null);
  };

  const handleRenameSave = async (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameChat(id, editTitle);
    }
    setEditingChatId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(id);
    }
    setActiveMenuId(null);
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="app-logo">GA</div>
            <span className="app-name">Grasp AI</span>
          </div>
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="sidebar-nav">
          <button className={`nav-item ${!activeChat ? 'active' : ''}`} onClick={createNewChat}>
            <div className="nav-icon"><Plus size={16} /></div>
            <span>New Chat</span>
          </button>
          <button className="nav-item" onClick={() => setIsSearchOpen(true)}>
            <div className="nav-icon"><Search size={16} /></div>
            <span>Search</span>
          </button>
        </div>

        <div className="sidebar-history">
          <div className="history-section">
            <div className="history-title">Recent Chats</div>
            <div className="history-list">
              {chats.length === 0 ? (
                <div className="no-history">No conversations yet</div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat.id}
                    className={`history-item-container ${activeChat === chat.id ? 'active' : ''}`}
                    onClick={() => selectChat(chat.id)}
                  >
                    {editingChatId === chat.id ? (
                      <div className="rename-input-group">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(e, chat.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rename-input"
                        />
                        <button className="rename-btn" onClick={(e) => handleRenameSave(e, chat.id)}><Check size={14}/></button>
                        <button className="rename-btn" onClick={(e) => { e.stopPropagation(); setEditingChatId(null); }}><X size={14}/></button>
                      </div>
                    ) : (
                      <>
                        <div className="history-link">
                          <MessageSquare size={16} />
                          <span className="truncate">{chat.title}</span>
                        </div>

                        <div className="history-actions">
                          <button
                            className="action-icon-btn"
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === chat.id ? null : chat.id); }}
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activeMenuId === chat.id && (
                            <div className="history-dropdown">
                              <button onClick={(e) => handleRenameStart(e, chat)}><Edit2 size={12}/> Rename</button>
                              <button onClick={(e) => handleDelete(e, chat.id)} className="text-danger"><Trash2 size={12}/> Delete</button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
            <div className="avatar"><User size={20} /></div>
            <MoreHorizontal size={18} className="profile-more" />
          </div>
          
          {profileMenuOpen && (
            <div className="profile-menu">
              <button onClick={() => setProfileMenuOpen(false)}>
                <Settings size={16} /> Settings
              </button>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
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
