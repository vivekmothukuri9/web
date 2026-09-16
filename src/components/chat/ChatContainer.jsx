import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../../context/AppProvider';
import { User, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Check, Volume2, Flag, Trash2 } from 'lucide-react';
import './ChatContainer.css';

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">javascript</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}
        </button>
      </div>
      <pre className="code-content">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

const AssistantMessage = ({ content, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Very basic mock markdown parser for code blocks only
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="thinking-indicator animate-pulse">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      );
    }

    const parts = content.split('```');
    if (parts.length === 1) return <p>{content}</p>;

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // It's a code block, remove lang if present (e.g. javascript\n...)
        const codeContent = part.replace(/^[a-z]+\n/, '');
        return <CodeBlock key={index} code={codeContent} />;
      }
      return <p key={index}>{part}</p>;
    });
  };

  return (
    <div className="message assistant-message animate-fade-in">
      <div className="message-avatar assistant-avatar">LA</div>
      <div className="message-body">
        <div className="message-content">{renderContent()}</div>
        {!isLoading && (
          <div className="message-actions">
            <button className="action-btn" onClick={handleCopy} title="Copy">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button className="action-btn" title="Good response"><ThumbsUp size={16} /></button>
            <button className="action-btn" title="Bad response"><ThumbsDown size={16} /></button>
            <button className="action-btn" title="Regenerate"><RotateCcw size={16} /></button>
            <div className="action-more-wrapper">
              <button className="action-btn" onClick={() => setMoreMenuOpen(!moreMenuOpen)} title="More">
                <MoreHorizontal size={16} />
              </button>
              {moreMenuOpen && (
                <div className="action-more-menu">
                  <button><Volume2 size={14} /> Read aloud</button>
                  <button onClick={handleCopy}><Copy size={14} /> Copy</button>
                  <button><RotateCcw size={14} /> Regenerate</button>
                  <button><Flag size={14} /> Report</button>
                  <div className="divider"></div>
                  <button className="text-danger"><Trash2 size={14} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserMessage = ({ content, attachment }) => {
  return (
    <div className="message user-message animate-fade-in">
      <div className="message-avatar user-avatar"><User size={20} /></div>
      <div className="message-body">
        <div className="message-content">
          {attachment && (
            <div className="message-attachment">
              {attachment.type === 'image' ? (
                <img src={attachment.url} alt="attachment" className="chat-img-preview" />
              ) : (
                <div className="file-attachment-card">
                  <FileUp size={16} />
                  <span>{attachment.name || 'File Attachment'}</span>
                </div>
              )}
            </div>
          )}
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const { messages } = useContext(AppContext);
  const containerRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight > 100) {
        setShowScrollDown(true);
      } else {
        setShowScrollDown(false);
      }
    }
  };

  return (
    <div className="chat-container-wrapper">
      <div className="chat-container" ref={containerRef} onScroll={handleScroll}>
        <div className="chat-content">
          {messages.map(msg => (
            msg.role === 'user' 
              ? <UserMessage key={msg.id} content={msg.content} attachment={msg.attachment} />
              : <AssistantMessage key={msg.id} content={msg.content} isLoading={msg.isLoading} />
          ))}
        </div>
      </div>
      
      {showScrollDown && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          ↓
        </button>
      )}
    </div>
  );
};

export default ChatContainer;
