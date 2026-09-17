import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

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

  // Fetch Chats from Supabase
  const fetchChats = useCallback(async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChats(data);
    }
  }, []);

  // Fetch Messages for active chat
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Map database fields to UI component fields
      const formattedMessages = data.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        attachment: m.attachment_url ? {
          type: m.attachment_type,
          url: m.attachment_url,
          name: m.attachment_url.split('/').pop()
        } : null
      }));
      setMessages(formattedMessages);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat, fetchMessages]);

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
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = async (id) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);

    if (!error) {
      if (activeChat === id) {
        createNewChat();
      }
      fetchChats();
    }
  };

  const renameChat = async (id, newTitle) => {
    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', id);

    if (!error) {
      fetchChats();
    }
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
        currentView, setCurrentView,
        fetchChats,
        deleteChat, renameChat
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
