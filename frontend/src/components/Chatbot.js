import chatbotIcon from '../assets/chatbot.png';
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';

const Chatbot = ({ language, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // OBJEK BAHASA UNTUK CHATBOT
  const content = {
    ID: {
      header: "VeriHire AI Chatbot",
      status: "Online",
      welcome: "Halo! Ada yang bisa saya bantu terkait tips menghindari penipuan lowongan kerja?",
      placeholder: "Tanya sesuatu...",
      tips: "Coba tanya: 'Cara lapor penipuan' atau 'Ciri loker palsu'",
      loading: "Sedang mengetik...",
      error: "Gagal menyambung ke server."
    },
    EN: {
      header: "VeriHire AI Chatbot",
      status: "Online",
      welcome: "Hello! How can I help you today with tips on avoiding job scams?",
      placeholder: "Ask something...",
      tips: "Try asking: 'How to report scams' or 'Fake job signs'",
      loading: "Typing...",
      error: "Failed to connect to the server."
    }
  };

  const t = content[language || 'ID'];

  // Fetch history on mount or when user changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const response = await aiService.getChatHistory();
          if (response.success && response.history) {
            // Map backend { role, content } to frontend { text, isBot }
            const mappedHistory = response.history.map(msg => ({
              text: msg.content,
              isBot: msg.role === 'assistant'
            }));
            setChatHistory(mappedHistory);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      } else {
        // Guest users always start fresh
        setChatHistory([]);
      }
    };

    fetchHistory();
  }, [user]);

  // Scroll to bottom when chatHistory updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Append user message
    const newUserMsg = { text: message, isBot: false };
    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await aiService.chatBuddy(newUserMsg.text);
      if (response.success) {
        setChatHistory(prev => [...prev, { text: response.reply, isBot: true }]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || t.error;
      setChatHistory(prev => [...prev, { text: errorMsg, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* TOMBOL BULAT */}
      <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : (
          <img src={chatbotIcon} alt="chatbot" style={{ width: '24px', height: '24px' }} />
        )}
      </button>

      {/* JENDELA CHAT */}
      {isOpen && (
        <div className="chatbot-window" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chatbot-header">
            <span>{t.header}</span>
            <div className="online-indicator">{t.status}</div>
          </div>
          
          <div className="chatbot-messages" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="message-bot" style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#000', padding: '10px', borderRadius: '8px', margin: '15px' }}>
              <p style={{ margin: 0 }}>{t.welcome}</p>
              <small style={{display: 'block', marginTop: '10px', color: '#64748B', fontStyle: 'italic'}}>
                {t.tips}
              </small>
            </div>
            
            {chatHistory.map((msg, index) => (
              <div key={index} className={msg.isBot ? "message-bot" : "message-user"} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', backgroundColor: msg.isBot ? '#e2e8f0' : '#4f46e5', color: msg.isBot ? '#000' : '#fff', padding: '10px', borderRadius: '8px', margin: '5px 15px', maxWidth: '80%', wordWrap: 'break-word', whiteSpace: 'pre-line', float: msg.isBot ? 'left' : 'right', clear: 'both' }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-bot" style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#000', padding: '10px', borderRadius: '8px', margin: '5px 15px', clear: 'both', width: 'fit-content' }}>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#64748B' }}>{t.loading}</p>
              </div>
            )}
            <div ref={messagesEndRef} style={{ clear: 'both' }} />
          </div>

          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder={t.placeholder} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chatbot-send-btn" onClick={handleSendMessage} disabled={isLoading}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;