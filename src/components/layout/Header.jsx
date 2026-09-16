import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppProvider';
import { Menu, Share, MoreHorizontal, ChevronDown, Check } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { isSidebarOpen, setIsSidebarOpen, activeChat, chats, model, setModel } = useContext(AppContext);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const currentChat = chats.find(c => c.id === activeChat);

  const models = [
    { id: 'Grasp AI', desc: 'Fast, everyday model' },
    { id: 'Fast AI', desc: 'Optimized for speed' },
    { id: 'Smart AI', desc: 'Advanced reasoning' },
    { id: 'Custom Model', desc: 'Your fine-tuned model' }
  ];

  return (
    <header className="header">
      <div className="header-left">
        {!isSidebarOpen && (
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        )}
        {activeChat && currentChat && (
          <span className="header-title truncate">{currentChat.title}</span>
        )}
      </div>

      <div className="header-center">
        <div className="model-selector-wrapper">
          <button 
            className="model-selector-btn" 
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          >
            {model} <ChevronDown size={16} />
          </button>

          {modelDropdownOpen && (
            <div className="model-dropdown">
              {models.map(m => (
                <button 
                  key={m.id} 
                  className="model-option"
                  onClick={() => { setModel(m.id); setModelDropdownOpen(false); }}
                >
                  <div className="model-info">
                    <span className="model-name">{m.id}</span>
                    <span className="model-desc">{m.desc}</span>
                  </div>
                  {model === m.id && <Check size={16} className="text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          <Share size={18} />
        </button>
        
        <div className="more-menu-wrapper">
          <button className="icon-btn" onClick={() => setMoreMenuOpen(!moreMenuOpen)}>
            <MoreHorizontal size={18} />
          </button>
          
          {moreMenuOpen && (
            <div className="more-dropdown">
              <button>Rename</button>
              <button>Delete</button>
              <div className="divider"></div>
              <button className="danger">Clear conversation</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
