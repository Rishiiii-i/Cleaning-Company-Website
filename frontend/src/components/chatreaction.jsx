import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { REACTION_EMOJIS } from '../utils/chatreaction';
import './chatreaction.css';

// reactions
export default function ChatReaction({ reactions = {}, currentUserId = '', onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef(null);
  const userKey = String(currentUserId || '').toLowerCase().trim();

  // close picker
  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const entries = Object.entries(reactions || {}).filter(([_, users]) => Array.isArray(users) && users.length > 0);

  // pick emoji
  const handleEmojiClick = (emoji) => {
    setShowPicker(false);
    if (typeof onReact === 'function') {
      onReact(emoji);
    }
  };

  return (
    <div className="chat-reaction-row" ref={containerRef}>
      {entries.map(([emoji, users]) => {
        const hasReacted = users.includes(userKey);
        return (
          <button
            key={emoji}
            type="button"
            className={`chat-reaction-pill ${hasReacted ? 'active' : ''}`}
            onClick={() => handleEmojiClick(emoji)}
            title={hasReacted ? 'remove reaction' : 'react with ' + emoji}
          >
            <span className="chat-reaction-emoji">{emoji}</span>
            <span className="chat-reaction-count">{users.length}</span>
          </button>
        );
      })}

      <div className="chat-reaction-trigger-wrap">
        <button
          type="button"
          className={`chat-reaction-trigger-btn ${showPicker ? 'open' : ''}`}
          onClick={() => setShowPicker(!showPicker)}
          title="add reaction"
        >
          <Smile size={13} />
        </button>

        {showPicker && (
          <div className="chat-reaction-picker">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="chat-reaction-btn"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
