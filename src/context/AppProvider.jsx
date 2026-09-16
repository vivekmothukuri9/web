import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [model, setModel] = useState('Grasp AI');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'web-sessions'

  // Apply Theme
  useEffect(() => {
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [theme]);

  // Handle mobile responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const selectChat = (id) => {
    setActiveChat(id);
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setMessages([
        { id: 1, role: 'user', content: 'Can you tell me more about ' + chat.title + '?' },
        { id: 2, role: 'assistant', content: 'Sure! What would you like to know about ' + chat.title + '?' }
      ]);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        theme, setTheme,
        isSidebarOpen, setIsSidebarOpen,
        activeChat, setActiveChat,
        messages, setMessages,
        chats, setChats,
        model, setModel,
        isSettingsOpen, setIsSettingsOpen,
        isSearchOpen, setIsSearchOpen,
        isShortcutsOpen, setIsShortcutsOpen,
        createNewChat, selectChat,
        currentView, setCurrentView
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
