import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppProvider';
import { Plus, Mic, Send, Paperclip, Camera, FileUp, X, Square } from 'lucide-react';
import './Composer.css';

const Composer = () => {
  const { setMessages, activeChat, setActiveChat, messages } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (!activeChat) {
      setActiveChat(Date.now());
    }

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Mock AI response
    const loadingId = Date.now() + 1;
    setTimeout(() => {
      setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '...', isLoading: true }]);
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === loadingId ? { id: loadingId, role: 'assistant', content: `Here is a mock response to "${newMessage.content}".\n\n\`\`\`javascript\nconsole.log("Hello, World!");\n\`\`\``, isLoading: false } : msg
        ));
      }, 1500);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="composer-container">
      {isRecording ? (
        <div className="recording-ui animate-fade-in">
          <div className="recording-indicator">
            <div className="recording-dot animate-pulse"></div>
            <span>Recording...</span>
          </div>
          <div className="recording-actions">
            <button className="icon-btn" onClick={() => setIsRecording(false)}>
              <X size={20} />
            </button>
            <button className="icon-btn stop-btn" onClick={() => setIsRecording(false)}>
              <Square size={20} className="text-danger" />
            </button>
          </div>
        </div>
      ) : (
        <div className="composer-input-wrapper">
          <div className="composer-actions-left">
            <div className="attachment-wrapper">
              <button 
                className="composer-icon-btn"
                onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
              >
                <Plus size={20} />
              </button>
              
              {attachmentMenuOpen && (
                <div className="attachment-menu animate-fade-in">
                  <button><FileUp size={16} /> Upload file</button>
                  <button><Paperclip size={16} /> Add image</button>
                  <button><Camera size={16} /> Camera</button>
                </div>
              )}
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            placeholder="Message Grasp AI"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          
          <div className="composer-actions-right">
            {!inputText.trim() ? (
              <button className="composer-icon-btn" onClick={() => setIsRecording(true)}>
                <Mic size={20} />
              </button>
            ) : (
              <button className="send-btn animate-fade-in" onClick={handleSend}>
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="composer-footer">
        <p>Grasp AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
};

export default Composer;
