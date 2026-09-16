import React, { useContext } from 'react';
import { AppContext } from '../../context/AppProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatContainer from '../chat/ChatContainer';
import WelcomeScreen from '../chat/WelcomeScreen';
import Composer from '../chat/Composer';
import WebSessions from './WebSessions';
import './AppShell.css';

const AppShell = () => {
  const { activeChat, currentView } = useContext(AppContext);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-area">
          {currentView === 'web-sessions' ? (
            <WebSessions />
          ) : activeChat ? (
            <ChatContainer />
          ) : (
            <WelcomeScreen />
          )}
        </div>
        {currentView !== 'web-sessions' && (
          <div className="composer-wrapper">
            <Composer />
          </div>
        )}
      </main>
    </div>
  );
};

export default AppShell;
