import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppProvider';
import { X, Search, MessageSquare } from 'lucide-react';
import './Modal.css';

const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, chats, selectChat } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="search-input-wrapper w-full" style={{ marginBottom: 0 }}>
            <Search size={18} className="text-tertiary" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button className="close-btn" style={{ marginLeft: '1rem' }} onClick={() => setIsSearchOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '400px' }}>
          {filteredChats.length > 0 ? (
            <div className="search-results">
              {filteredChats.map(chat => (
                <div 
                  key={chat.id} 
                  className="search-result"
                  onClick={() => { selectChat(chat.id); setIsSearchOpen(false); }}
                >
                  <MessageSquare size={16} className="text-secondary" />
                  <span>{chat.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary py-4">
              No conversations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
