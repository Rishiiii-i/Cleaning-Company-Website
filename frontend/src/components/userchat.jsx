import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldCheck, Smile, Trash2, Paperclip, FileText, Download, X } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { sendNotification } from '../utils/notify';
import { broadcastChatEvent } from '../utils/chatnotif';
import { subscribeChatWs } from '../utils/socket';
import ChatFile from './chatfile';
import { extractFilesFromMessages } from '../utils/filestore';
import ImgView from './imgview';
import ChatReaction from './chatreaction';
import { toggleReaction, saveReactionToFirestore, saveReactionToBackend } from '../utils/chatreaction';
import './userchat.css';

// chat
export default function UserChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showFileStorage, setShowFileStorage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const hasInitialScrolledRef = useRef(false);
  useEffect(() => {
    const handleDocClick = (e) => {
      const target = e.target;
      if (target && target.matches && target.matches('.chat-message-image, .chat-image-link, .chat-preview-thumb')) {
        e.preventDefault();
        e.stopPropagation();
        const img = target.tagName === 'IMG' ? target : target.querySelector('img');
        if (img && img.src) {
          setPreviewImage({
            url: img.src,
            name: img.alt || 'image'
          });
        }
      }
    };
    document.addEventListener('click', handleDocClick, true);
    return () => document.removeEventListener('click', handleDocClick, true);
  }, []);

  const emojiList = ['😊', '😂', '👍', '❤️', '🎉', '🙏', '✨', '🧹', '🏠', '🧼', '👋', '🔥', '⭐', '💼', '✅', '🙌', '💯', '📞', '💡', '👌', '😍', '🥳', '👏', '💪'];

  const candidateEmail = (user?.email || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.email : '') || '').toLowerCase().trim();
  const candidateName = user?.name || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.name : '') || 'Customer';

  // merge messages
  const mergeMessages = (prevList, incomingList) => {
    let custDelMsgs = [];
    let custClearedAt = 0;
    try {
      custDelMsgs = JSON.parse(localStorage.getItem(`cust_del_msgs_${candidateEmail}`) || '[]');
      custClearedAt = Number(localStorage.getItem(`cust_chat_cleared_${candidateEmail}`) || 0);
    } catch (e) {}
    const isCustDeleted = (m) => {
      if (!m) return true;
      if (m.deletedForCustomer) return true;
      if (m.id && custDelMsgs.includes(m.id)) return true;
      if (m._id && custDelMsgs.includes(m._id)) return true;
      if (custClearedAt && (m.createdAt || 0) <= custClearedAt) return true;
      return false;
    };
    prevList = prevList.filter((m) => !isCustDeleted(m));
    incomingList = incomingList.filter((m) => !isCustDeleted(m));
    const map = new Map();
    // old messages
    prevList.forEach((m) => {
      const sig = `${m.senderRole}_${m.createdAt}_${m.text || ''}_${m.file?.name || ''}`;
      map.set(sig, m);
    });
    // new messages
    incomingList.forEach((m) => {
      const sig = `${m.senderRole}_${m.createdAt}_${m.text || ''}_${m.file?.name || ''}`;
      map.set(sig, m);
    });
    const list = Array.from(map.values());
    list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    return list;
  };

  // mark read
  const markMessagesAsRead = async () => {
    if (!candidateEmail) return;
    try {
      await fetch('http://localhost:5000/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateEmail, senderRole: 'admin' })
      });
    } catch (err) {}

    if (db) {
      try {
        const q = query(collection(db, 'chats'), where('candidateEmail', '==', candidateEmail));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.senderRole === 'admin') {
            updateDoc(doc(db, 'chats', d.id), { read: true });
          }
        });
      } catch (err) {}
    }
  };

  // get messages
  const fetchDbMessages = async () => {
    if (!candidateEmail) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages?email=${encodeURIComponent(candidateEmail)}`);
      if (res.ok) {
        const data = await res.json();
        const hasUnread = (data || []).some((m) => !m.read && m.senderRole === 'admin');
        if (hasUnread) {
          markMessagesAsRead();
        }
        const updated = (data || []).map((m) => (m.senderRole === 'admin' ? { ...m, read: true } : m));
        setMessages((prev) => mergeMessages(prev, updated));
      }
    } catch (err) {
      console.warn('db fetch error:', err);
    }
  };

  // check messages
  useEffect(() => {
    markMessagesAsRead();
    fetchDbMessages();
    const interval = setInterval(fetchDbMessages, 3000);
    return () => clearInterval(interval);
  }, [candidateEmail]);

  // live messages
  useEffect(() => {
    if (!candidateEmail) return;
    const unsubWs = subscribeChatWs('customer', candidateEmail, (data) => {
      if (data) {
        if (data.isReaction) {
          setMessages((prev) =>
            prev.map((m) => {
              const isMatch = (data.id && m.id === data.id) || (data._id && (m.id === data._id || m._id === data._id)) || (m.createdAt === data.createdAt && m.candidateEmail === data.candidateEmail);
              return isMatch ? { ...m, reactions: data.reactions } : m;
            })
          );
        } else if (data.senderRole === 'admin') {
          setMessages((prev) => mergeMessages(prev, [{ ...data, read: true }]));
          markMessagesAsRead();
        }
      }
    });
    return () => {
      if (typeof unsubWs === 'function') unsubWs();
    };
  }, [candidateEmail]);

  // get permission
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // live chat
  useEffect(() => {
    if (!db || !candidateEmail) return;

    let isInitial = true;
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'chats'), where('candidateEmail', '==', candidateEmail));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const mappedList = firestoreList.map((m) => (m.senderRole === 'admin' ? { ...m, read: true } : m));
        setMessages((prev) => mergeMessages(prev, mappedList));

        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.senderRole === 'admin') {
            if (!isInitial) {
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('New message from Admin', { body: data.text || 'Sent an attachment' });
              }
            }
            updateDoc(doc(db, 'chats', d.id), { read: true });
            fetch('http://localhost:5000/api/messages/read', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ candidateEmail, senderRole: 'admin' })
            }).catch(() => {});
          }
        });
        isInitial = false;
      }, (err) => {
        console.warn('firestore chat error:', err);
      });
    } catch (err) {
      console.warn('firestore init error:', err);
    }

    return () => unsubscribe();
  }, [candidateEmail]);

  useEffect(() => {
    const container = scrollRef.current?.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      const isCountIncreased = messages.length > (prevMsgCountRef.current || 0);
      const isInitial = !hasInitialScrolledRef.current;
      prevMsgCountRef.current = messages.length;

      if (isInitial || (isCountIncreased && isNearBottom)) {
        hasInitialScrolledRef.current = true;
        container.scrollTop = container.scrollHeight;
      }
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // pick emoji
  const handleSelectEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojis(false);
  };

  // pick file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('file size must be under 10MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        url: reader.result,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  // remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if ((!text && !selectedFile) || isSending) return;

    const fileToSend = selectedFile;
    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowEmojis(false);
    setIsSending(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const createdAt = Date.now();

    const newMsgData = {
      text,
      senderRole: 'candidate',
      senderName: candidateName,
      senderEmail: candidateEmail,
      candidateEmail,
      candidateName,
      time: timeStr,
      date: dateStr,
      createdAt,
      read: false,
      file: fileToSend ? {
        url: fileToSend.url,
        name: fileToSend.name,
        type: fileToSend.type,
        size: fileToSend.size
      } : null
    };

    setMessages((prev) => mergeMessages(prev, [{ ...newMsgData, id: `local_${createdAt}` }]));
    setTimeout(() => {
      if (scrollRef.current?.parentElement) {
        scrollRef.current.parentElement.scrollTop = scrollRef.current.parentElement.scrollHeight;
      }
    }, 40);

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsgData)
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => mergeMessages(prev, [saved]));
      }
    } catch (err) {
      console.warn('database save error:', err);
    } finally {
      setIsSending(false);
    }

    if (db) {
      try {
        addDoc(collection(db, 'chats'), newMsgData).catch(() => {});
      } catch (err) {
        console.warn('firestore save error:', err);
      }
    }

    // notify admin
    sendNotification({
      title: `New message from ${candidateName}`,
      message: text || (fileToSend ? `Sent file: ${fileToSend.name}` : 'New message'),
      recipient: 'admin',
      type: 'chat'
    });
    broadcastChatEvent({
      title: `New message from ${candidateName}`,
      message: text || (fileToSend ? `Sent file: ${fileToSend.name}` : 'New message'),
      recipient: 'admin',
      senderRole: 'candidate',
      senderName: candidateName,
      type: 'chat',
      date: dateStr,
      time: timeStr
    });
  };

  // delete message
  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId && m._id !== msgId));
    try {
      const key = `cust_del_msgs_${candidateEmail}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.includes(msgId)) {
        existing.push(msgId);
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (e) {}
    try {
      fetch(`http://localhost:5000/api/messages/${msgId}?role=customer`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' })
      }).catch(() => {});
    } catch (e) {}
    if (db && !msgId.startsWith('local_')) {
      try {
        updateDoc(doc(db, 'chats', msgId), { deletedForCustomer: true }).catch(() => {});
      } catch (e) {}
    }
    return;
    if (!msgId) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));

    try {
      await fetch(`http://localhost:5000/api/messages/${msgId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('delete msg error:', err);
    }

    if (db && !msgId.startsWith('local_')) {
      try {
        await deleteDoc(doc(db, 'chats', msgId));
      } catch (err) {
        console.warn('firestore delete error:', err);
      }
    }
  };

  // toggle message reaction
  const handleToggleReaction = (msg, emoji) => {
    if (!msg) return;
    const currentId = candidateEmail || 'customer';
    const newReactions = toggleReaction(msg.reactions, emoji, currentId);
    setMessages((prev) =>
      prev.map((m) => {
        const isMatch = m.id === msg.id || (m.createdAt === msg.createdAt && m.senderRole === msg.senderRole);
        return isMatch ? { ...m, reactions: newReactions } : m;
      })
    );
    saveReactionToFirestore(db, msg, newReactions);
    saveReactionToBackend(msg, newReactions);
    // send reaction notification
    if (newReactions[emoji]?.includes(currentId)) {
      sendNotification({
        title: `${candidateName} reacted to your message`,
        message: msg.text ? `To: "${msg.text}"` : 'New reaction',
        recipient: 'admin',
        type: 'chat'
      });
      broadcastChatEvent({
        title: `${candidateName} reacted to your message`,
        message: msg.text ? `To: "${msg.text}"` : 'New reaction',
        recipient: 'admin',
        senderRole: 'candidate',
        senderName: candidateName,
        type: 'chat'
      });
      const mId = msg._id || msg.id;
      if (mId && !String(mId).startsWith('local_')) {
        fetch(`http://localhost:5000/api/messages/${mId}/react`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reactions: newReactions,
            reactorRole: 'candidate',
            reactorName: candidateName,
            isReactionAdd: true
          })
        }).catch(() => {});
      }
    }
  };

  // delete chat
  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete this chat history?')) return;
    const clearTime = Date.now();
    try {
      localStorage.setItem(`cust_chat_cleared_${candidateEmail}`, String(clearTime));
    } catch (e) {}
    setMessages([]);
    try {
      fetch(`http://localhost:5000/api/messages?email=${encodeURIComponent(candidateEmail)}&role=customer`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' })
      }).catch(() => {});
    } catch (e) {}
    if (db && candidateEmail) {
      try {
        getDocs(query(collection(db, 'chats'), where('candidateEmail', '==', candidateEmail)))
          .then((snap) => {
            snap.docs.forEach((d) => {
              updateDoc(doc(db, 'chats', d.id), { deletedForCustomer: true }).catch(() => {});
            });
          })
          .catch(() => {});
      } catch (e) {}
    }
    return;
    setMessages([]);

    try {
      await fetch(`http://localhost:5000/api/messages?email=${encodeURIComponent(candidateEmail)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('delete chat error:', err);
    }

    if (db) {
      try {
        const q = query(collection(db, 'chats'), where('candidateEmail', '==', candidateEmail));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => deleteDoc(doc(db, 'chats', d.id)));
      } catch (err) {
        console.warn('firestore clear error:', err);
      }
    }
  };

  const unreadAdminCount = messages.filter((m) => !m.read && m.senderRole === 'admin').length;

  return (
    <div className="user-chat-box">
      <div className="user-chat-header">
        <div className="user-chat-header-info">
          <div className="user-chat-avatar">
            <ShieldCheck size={22} />
            {unreadAdminCount > 0 && <span className="user-chat-avatar-dot"></span>}
          </div>
          <div className="user-chat-header-text">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3>Admin Support</h3>
              {unreadAdminCount > 0 && (
                <span className="user-chat-unread-badge">
                  {unreadAdminCount}
                </span>
              )}
            </div>
            <span className="user-chat-status">
              <span className="user-chat-status-dot"></span>
              online
            </span>
          </div>
        </div>

        <button
          type="button"
          className="chat-header-files-btn"
          onClick={() => setShowFileStorage((prev) => !prev)}
          title="chat files"
        >
          <Paperclip size={14} />
          <span>files ({extractFilesFromMessages(messages).length})</span>
        </button>

        {messages.length > 0 && (
          <button
            type="button"
            className="chat-header-delete-btn"
            onClick={handleDeleteChat}
            title="delete entire chat"
          >
            <Trash2 size={14} />
            <span>delete chat</span>
          </button>
        )}
      </div>

      <ChatFile
        isOpen={showFileStorage}
        onClose={() => setShowFileStorage(false)}
        files={extractFilesFromMessages(messages)}
        role="customer"
        chatId={candidateEmail}
        onFileUploaded={(stored) => {
          setSelectedFile(stored);
        }}
      />

      <ImgView
        isOpen={!!previewImage}
        src={previewImage?.url}
        name={previewImage?.name}
        size={previewImage?.size}
        onClose={() => setPreviewImage(null)}
      />

      <div className="user-chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <MessageSquare size={26} />
            </div>
            <h4>no messages yet</h4>
            <p>send a message to start chatting with the admin.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === 'candidate';
            return (
              <div
                key={msg.id || `${msg.createdAt}_${msg.text}`}
                className={`chat-message-row ${isMe ? 'me' : 'other'}`}
              >
                <span className="chat-sender-label">
                  {isMe ? 'you' : 'admin'}
                  {!isMe && !msg.read && <span className="chat-new-mark">new</span>}
                </span>
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble">
                    {msg.file && msg.file.url && (
                      <div className="chat-file-bubble">
                        {msg.file.type?.startsWith('image/') || msg.file.url.startsWith('data:image') ? (
                          <a href={msg.file.url} target="_blank" rel="noreferrer" className="chat-image-link" title="view photo">
                            <img src={msg.file.url} alt={msg.file.name || 'photo'} className="chat-message-image" />
                          </a>
                        ) : (
                          <a href={msg.file.url} download={msg.file.name || 'attachment'} target="_blank" rel="noreferrer" className="chat-doc-card" title="download file">
                            <div className="chat-doc-icon">
                              <FileText size={20} />
                            </div>
                            <div className="chat-doc-details">
                              <span className="chat-doc-name">{msg.file.name || 'file attachment'}</span>
                              <span className="chat-doc-size">{formatFileSize(msg.file.size)}</span>
                            </div>
                            <Download size={16} className="chat-doc-dl-icon" />
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && (
                      <div className="chat-bubble-text">{msg.text}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="chat-msg-delete-btn"
                    onClick={() => handleDeleteMessage(msg.id)}
                    title="delete message"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <ChatReaction
                  reactions={msg.reactions}
                  currentUserId={candidateEmail || 'customer'}
                  onReact={(emoji) => handleToggleReaction(msg, emoji)}
                />
                <span className="chat-time-label">
                  {msg.time || msg.date || ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {showEmojis && (
        <div className="chat-emoji-popover">
          <div className="chat-emoji-grid">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="chat-emoji-btn"
                onClick={() => handleSelectEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="chat-file-preview-strip">
          <div className="chat-preview-left">
            {selectedFile.type?.startsWith('image/') ? (
              <img src={selectedFile.url} alt="preview" className="chat-preview-thumb" />
            ) : (
              <div className="chat-preview-icon">
                <FileText size={18} />
              </div>
            )}
            <div className="chat-preview-meta">
              <span className="chat-preview-name">{selectedFile.name}</span>
              <span className="chat-preview-size">{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>
          <button
            type="button"
            className="chat-preview-clear-btn"
            onClick={handleRemoveFile}
            title="remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="user-chat-input-area">
        <div className="chat-media-buttons">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.zip"
          />
          <button
            type="button"
            className="chat-icon-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="send photo or file"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            className={`chat-icon-action-btn ${showEmojis ? 'active' : ''}`}
            onClick={() => setShowEmojis(!showEmojis)}
            title="insert emoji"
          >
            <Smile size={19} />
          </button>
        </div>

        <input
          type="text"
          className="user-chat-input"
          placeholder="type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedFile) || isSending}
          className="user-chat-send-btn"
        >
          <Send size={16} />
          <span>send</span>
        </button>
      </form>
    </div>
  );
}
