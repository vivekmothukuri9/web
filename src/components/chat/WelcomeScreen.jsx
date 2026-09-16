import React, { useContext } from 'react';
import { Lightbulb, Code, PenTool, GraduationCap } from 'lucide-react';
import { AppContext } from '../../context/AppProvider';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const { setMessages, setActiveChat } = useContext(AppContext);

  const suggestions = [
    {
      icon: <Lightbulb size={24} className="text-yellow-500" />,
      title: "Explain something",
      prompt: "Explain quantum computing simply"
    },
    {
      icon: <Code size={24} className="text-blue-500" />,
      title: "Write code",
      prompt: "Create a React login page"
    },
    {
      icon: <PenTool size={24} className="text-purple-500" />,
      title: "Write",
      prompt: "Write a professional email"
    },
    {
      icon: <GraduationCap size={24} className="text-green-500" />,
      title: "Learn",
      prompt: "Teach me Python from basics"
    }
  ];

  const handleSuggestionClick = (prompt) => {
    // In a real app, this would populate the input field.
    // For mock purposes, we'll just simulate sending it.
    setActiveChat(Date.now());
    setMessages([{ id: Date.now(), role: 'user', content: prompt }]);
    
    // Simulate AI thinking and response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, role: 'assistant', content: `Here is a response to: "${prompt}"\n\nThis is a mocked local response.` }
      ]);
    }, 1500);
  };

  return (
    <div className="welcome-screen animate-fade-in">
      <div className="welcome-header">
        <h1>How can I help you today?</h1>
        <p>Ask anything, explore ideas, or get help with your work.</p>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((item, index) => (
          <button 
            key={index} 
            className="suggestion-card animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleSuggestionClick(item.prompt)}
          >
            <div className="suggestion-icon">
              {item.icon}
            </div>
            <div className="suggestion-content">
              <h3>{item.title}</h3>
              <p>{item.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
