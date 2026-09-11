import React, { useState, useEffect, useRef } from 'react';
import badgeIcon from '../assets/badge-check.png';
import closeIcon from '../assets/close.png';
import './aireply.css';

// ai reply
export default function AiReply({
  messages = [],
  lastCustomerMessage,
  onSelectReply,
  candidateName = 'Customer',
  conversationId = ''
}) {
  // state
  const [dismissed, setDismissed] = useState(false);
  const [usedPills, setUsedPills] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('');
  const reqSeq = useRef(0);

  const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMsgSig = lastMessage ? `${lastMessage.id || lastMessage._id || ''}_${lastMessage.createdAt || ''}_${lastMessage.senderRole || ''}_${lastMessage.text || ''}` : '';

  // reset
  useEffect(() => {
    setDismissed(false);
    setUsedPills([]);
    setReplies([]);
  }, [conversationId]);

  // reset
  useEffect(() => {
    setDismissed(false);
  }, [lastMsgSig]);

  // fetch
  useEffect(() => {
    if (!messages || messages.length === 0 || !lastMessage || !lastMessage.text) {
      setReplies([]);
      setLoading(false);
      return;
    }

    const seq = ++reqSeq.current;
    const controller = new AbortController();
    setLoading(true);

    const getReplies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ollama/smart-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.slice(-6),
            candidateName: candidateName
          }),
          signal: controller.signal
        });

        if (!res.ok) {
          if (seq === reqSeq.current) setLoading(false);
          return;
        }

        const data = await res.json();
        if (seq === reqSeq.current) {
          setLoading(false);
          if (data.success && Array.isArray(data.replies) && data.replies.length > 0) {
            setReplies(data.replies);
            if (data.model) setModel(data.model);
          }
        }
      } catch (err) {
        if (seq === reqSeq.current) setLoading(false);
      }
    };

    getReplies();
    return () => controller.abort();
  }, [conversationId, lastMsgSig, candidateName]);

  // check
  if (dismissed || !messages || messages.length === 0 || !lastMessage || !lastMessage.text) return null;

  // filter
  const sent = new Set(messages.map(m => (m.text || '').toLowerCase().trim()));
  usedPills.forEach(p => sent.add(p));

  const isLastFromAdmin = lastMessage.senderRole === 'admin';
  const suggestions = (replies || [])
    .filter(r => !sent.has(r.toLowerCase().trim()))
    .slice(0, 3);

  // check
  if (!loading && suggestions.length === 0) return null;

  // select
  const handleClick = (text) => {
    setUsedPills(prev => [...prev, text.toLowerCase().trim()]);
    setReplies([]);
    if (onSelectReply) onSelectReply(text);
  };

  // render
  return (
    <div className="aireply-box">
      <div className="aireply-header">
        <div className="aireply-title-wrap">
          <img src={badgeIcon} alt="AI" className="aireply-badge" />
          <span className="aireply-title">
            {isLastFromAdmin ? 'AI Next Step' : 'AI Smart Replies'}
            {model && <span className="aireply-tag">{model}</span>}
          </span>
        </div>
        <button
          type="button"
          className="aireply-close"
          onClick={() => setDismissed(true)}
          title="Dismiss"
        >
          <img src={closeIcon} alt="Close" className="aireply-close-icon" />
        </button>
      </div>

      {loading && suggestions.length === 0 ? (
        <div className="aireply-loading">Generating AI suggestions...</div>
      ) : (
        <div className="aireply-pills">
          {suggestions.map((item, i) => (
            <button
              key={i}
              type="button"
              className="aireply-pill"
              onClick={() => handleClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
