import React, { useState } from 'react';

// Simple floating chatbot widget that talks to the Python chatbot backend
// Expects the Python service to be reachable at REACT_APP_CHATBOT_URL or http://localhost:5001
const CHATBOT_BASE_URL = process.env.REACT_APP_CHATBOT_URL || 'http://localhost:5001';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything about Plateful or food safety.' }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch(`${CHATBOT_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await res.json();
      const botText = (data && (data.response ?? data.message)) || 'Sorry, I did not understand that.';
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error contacting chatbot service.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 1000 }}>
      {isOpen && (
        <div style={{
          width: '320px',
          height: '420px',
          background: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{ padding: '12px 14px', background: '#111827', color: 'white', fontWeight: 600 }}>
            Plateful Assistant
          </div>
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#F9FAFB' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: m.role === 'user' ? '#2563EB' : 'white',
                  color: m.role === 'user' ? 'white' : '#111827',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px', background: 'white', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  outline: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isSending}
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  opacity: isSending ? 0.7 : 1
                }}
              >Send</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          background: '#111827',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
        }}
        aria-label="Toggle chatbot"
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
}

export default ChatbotWidget;


