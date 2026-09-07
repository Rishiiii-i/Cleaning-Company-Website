import React, { useState, useRef, useEffect } from 'react';
import botJpeg from '../assets/bot.jpeg';
import chatJpeg from '../assets/chat.jpeg';
import sendPng from '../assets/send.png';
import closePng from '../assets/close.png';
import './chat.css';

// default questions shown in the chat
const defaultFaqs = [
  {
    label: 'Prices',
    q: 'What are your cleaning services and prices?',
    a: 'Here are our cleaning services and prices in Rupees (₹):\n• Regular House Cleaning: ₹500 / hour\n• Deep Cleaning: ₹900 / hour\n• Office Cleaning: ₹700 / hour\n• Move-In / Move-Out Cleaning: ₹3600 flat rate\nAll services include eco-friendly supplies and trained staff.'
  },
  {
    label: 'How to Book',
    q: 'How do I book a cleaning service?',
    a: 'Booking is very easy:\n1. Click "Schedule Your Cleaning" on the page.\n2. Choose your cleaning service.\n3. Pick your preferred date and time.\n4. Complete your booking with instant confirmation.'
  },
  {
    label: 'Supplies',
    q: 'Do you bring your own cleaning supplies?',
    a: 'Yes, our team brings all eco-friendly cleaning solutions, disinfectants, vacuums, and tools. You do not need to provide anything.'
  },
  {
    label: 'Cancellation',
    q: 'Can I reschedule or cancel my booking?',
    a: 'Yes, you can cancel or reschedule anytime up to 24 hours before your appointment from your customer dashboard with zero cancellation fee.'
  }
];

export default function Chat() {
  // controls whether the chat is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // stores all chat messages
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am GlowBot, your AI cleaning assistant. How can I help you today? You can choose a quick question below or type your own question.'
    }
  ]);

  // stores the user's input
  const [input, setInput] = useState('');

  // shows loading while waiting for response
  const [loading, setLoading] = useState(false);

  // used to scroll to the latest message
  const chatEndRef = useRef(null);

  // scroll to the bottom when a new message is added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // open or close the chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // handle quick question click
  const handleFaqClick = (faq) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: faq.q },
      { sender: 'bot', text: faq.a }
    ]);
  };

  // handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();

    // get the user's message
    const userText = input.trim();

    // check if input is empty
    if (!userText || loading) return;

    // add user message to chat
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // clear input box
    setInput('');

    // show loading
    setLoading(true);

    try {
      // send message to backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      // get backend response
      const data = await response.json();

      // add bot response to chat
      if (data && data.reply) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        // show default message if no response
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'We offer Regular Cleaning (₹500/hr), Deep Cleaning (₹900/hr), Office Cleaning (₹700/hr), and Move-In/Out (₹3600). Click Schedule Your Cleaning to book!'
          }
        ]);
      }
    } catch (err) {
      // show message if there is an error
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'We offer Regular Cleaning at ₹500/hr, Deep Cleaning at ₹900/hr, Office Cleaning at ₹700/hr, and Move-In/Out at ₹3600 flat rate. Please schedule online or reach out through our contact page.'
        }
      ]);
    } finally {
      // stop loading
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {/* button to open the chat */}
      <button
        type="button"
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label="Toggle AI Chat"
      >
        <img src={chatJpeg} alt="Chat Icon" className="chat-toggle-icon" />
        <span className="chat-badge"></span>
      </button>

      {/* show chat box when it is open */}
      {isOpen && (
        <div className="chat-box">
          {/* chat header */}
          <div className="chat-header">
            <div className="chat-header-info">
              {/* bot image */}
              <img src={botJpeg} alt="Bot Avatar" className="chat-avatar" />
              <div>
                <h3 className="chat-title">GlowBot AI</h3>
                {/* bot online status */}
                <p className="chat-status">
                  <span className="status-dot"></span> Online
                </p>
              </div>
            </div>
            {/* close chat button */}
            <button
              type="button"
              className="chat-close-btn"
              onClick={toggleChat}
              aria-label="Close Chat"
            >
              <img src={closePng} alt="Close Icon" className="chat-close-icon" />
            </button>
          </div>

          {/* chat messages */}
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-msg ${msg.sender === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}
              >
                {/* show bot image for bot messages */}
                {msg.sender === 'bot' && (
                  <img src={botJpeg} alt="Bot" className="chat-msg-avatar" />
                )}
                {/* display message */}
                <div className="chat-msg-bubble">{msg.text}</div>
              </div>
            ))}

            {/* show typing indicator */}
            {loading && (
              <div className="chat-msg chat-msg-bot">
                <img src={botJpeg} alt="Bot" className="chat-msg-avatar" />
                <div className="chat-msg-bubble chat-typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            {/* used to scroll to the latest message */}
            <div ref={chatEndRef} />
          </div>

          {/* quick questions */}
          <div className="chat-faq-area">
            <div className="chat-faq-title">Quick Questions</div>
            <div className="chat-faq-list">
              {defaultFaqs.map((faq, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chat-faq-btn"
                  onClick={() => handleFaqClick(faq)}
                  title={faq.q}
                >
                  {faq.label || faq.q}
                </button>
              ))}
            </div>
          </div>

          {/* message input area */}
          <div className="chat-footer">
            <form onSubmit={handleSend} className="chat-form">
              {/* input box */}
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about cleaning, prices..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              {/* send button */}
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !input.trim()}
                aria-label="Send Message"
              >
                <img src={sendPng} alt="Send Icon" className="chat-send-icon" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
