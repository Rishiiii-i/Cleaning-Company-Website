import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Plus, X, Mail, Check, Smile, Trash2, Paperclip, FileText, Download } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { sendNotification } from '../../utils/notify';
import { broadcastChatEvent } from '../../utils/chatnotif';
import { subscribeChatWs } from '../../utils/socket';
import ChatFile from '../../components/chatfile';
import { extractFilesFromMessages } from '../../utils/filestore';
import ImgView from '../../components/imgview';
import ChatReaction from '../../components/chatreaction';
import { toggleReaction, saveReactionToFirestore, saveReactionToBackend } from '../../utils/chatreaction';
import './adminchat.css';

// chat
export default function AdminChat({ customers = [], bookings = [] }) {
  const [allMessages, setAllMessages] = useState([]);
  const [candidateUsers, setCandidateUsers] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [showAddBox, setShowAddBox] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mailAlert, setMailAlert] = useState(null);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showFileStorage, setShowFileStorage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [isSendingCustomMail, setIsSendingCustomMail] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojiList = ['😊', '😂', '👍', '❤️', '🎉', '🙏', '✨', '🧹', '🏠', '🧼', '👋', '🔥', '⭐', '💼', '✅', '🙌', '💯', '📞', '💡', '👌', '😍', '🥳', '👏', '💪'];

  // get users
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCandidateUsers(data || []);
        }
      } catch (err) {
        console.warn('candidate fetch error:', err);
      }
    };
    loadCandidates();
  }, []);

  // merge messages
  const mergeMessages = (prevList, incomingList) => {
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

  // get messages
  const fetchDbMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/messages');
      if (res.ok) {
        const data = await res.json();
        setAllMessages((prev) => mergeMessages(prev, data || []));
      }
    } catch (err) {
      console.warn('db messages fetch error:', err);
    }
  };

  // check messages
  useEffect(() => {
    fetchDbMessages();
    const interval = setInterval(fetchDbMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // get permission
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // live chat
  useEffect(() => {
    if (!db) return;
    let isInitial = true;
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
        const firestoreList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllMessages((prev) => mergeMessages(prev, firestoreList));

        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.senderRole === 'candidate') {
            if (!isInitial) {
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification(`New message from ${data.candidateName || 'Customer'}`, { body: data.text || 'Sent an attachment' });
              }
            }
          }
        });
        isInitial = false;
      }, (err) => {
        console.warn('chat listen error:', err);
      });
    } catch (err) {
      console.warn('firestore init error:', err);
    }
    return () => unsubscribe();
  }, []);

  // live messages
  useEffect(() => {
    const unsubWs = subscribeChatWs('admin', 'admin@gmail.com', (data) => {
      if (data) {
        if (data.isReaction) {
          setAllMessages((prev) =>
            prev.map((m) => {
              const isMatch = (data.id && m.id === data.id) || (data._id && (m.id === data._id || m._id === data._id)) || (m.createdAt === data.createdAt && m.candidateEmail === data.candidateEmail);
              return isMatch ? { ...m, reactions: data.reactions } : m;
            })
          );
        } else if (data.senderRole === 'candidate') {
          setAllMessages((prev) => mergeMessages(prev, [data]));
        }
      }
    });
    return () => {
      if (typeof unsubWs === 'function') unsubWs();
    };
  }, []);

  // group messages
  const candidatesMap = {};

  (customers || []).forEach((c) => {
    const email = (c.email || c.userEmail || '').toLowerCase().trim();
    if (!email) return;
    if (!candidatesMap[email]) {
      candidatesMap[email] = {
        email,
        name: c.name || c.customerName || email.split('@')[0],
        messages: [],
        unreadCount: 0,
        lastTime: '',
        lastText: 'no messages yet',
        lastCreatedAt: 0
      };
    }
  });

  candidateUsers.forEach((c) => {
    const email = (c.email || '').toLowerCase().trim();
    if (!email) return;
    if (!candidatesMap[email]) {
      candidatesMap[email] = {
        email,
        name: c.name || email.split('@')[0],
        messages: [],
        unreadCount: 0,
        lastTime: '',
        lastText: 'no messages yet',
        lastCreatedAt: 0
      };
    }
  });

  (bookings || []).forEach((b) => {
    const email = (b.email || b.userEmail || '').toLowerCase().trim();
    if (!email) return;
    if (!candidatesMap[email]) {
      candidatesMap[email] = {
        email,
        name: b.customerName || email.split('@')[0],
        messages: [],
        unreadCount: 0,
        lastTime: '',
        lastText: 'no messages yet',
        lastCreatedAt: 0
      };
    }
  });

  allMessages.forEach((msg) => {
    const key = (msg.candidateEmail || '').toLowerCase().trim();
    if (!key) return;

    if (!candidatesMap[key]) {
      candidatesMap[key] = {
        email: key,
        name: msg.candidateName || key.split('@')[0],
        messages: [],
        unreadCount: 0,
        lastTime: msg.time || msg.date || '',
        lastText: msg.text || '',
        lastCreatedAt: msg.createdAt || 0
      };
    }

    candidatesMap[key].messages.push(msg);
    candidatesMap[key].lastTime = msg.time || msg.date || '';
    candidatesMap[key].lastText = msg.text || '';
    candidatesMap[key].lastCreatedAt = Math.max(candidatesMap[key].lastCreatedAt, msg.createdAt || 0);

    if (!msg.read && msg.senderRole === 'candidate') {
      candidatesMap[key].unreadCount += 1;
    }
  });

  const candidatesList = Object.values(candidatesMap).sort((a, b) => b.lastCreatedAt - a.lastCreatedAt);

  const filteredCandidates = candidatesList.filter((c) => {
    const query = searchText.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
  });

  // mark read
  useEffect(() => {
    if (!selectedCandidate) return;

    setAllMessages((prev) =>
      prev.map((m) =>
        (m.candidateEmail || '').toLowerCase().trim() === selectedCandidate.toLowerCase().trim() &&
        m.senderRole === 'candidate' &&
        !m.read
          ? { ...m, read: true }
          : m
      )
    );

    fetch('http://localhost:5000/api/messages/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateEmail: selectedCandidate, senderRole: 'candidate' })
    }).catch((err) => console.warn('db mark read error:', err));

    if (db) {
      const markReadFirestore = async () => {
        try {
          const q = query(collection(db, 'chats'), where('candidateEmail', '==', selectedCandidate));
          const snap = await getDocs(q);
          snap.docs.forEach((d) => {
            const data = d.data();
            if (!data.read && data.senderRole === 'candidate') {
              updateDoc(doc(db, 'chats', d.id), { read: true });
            }
          });
        } catch (err) {
          console.warn('read update error:', err);
        }
      };
      markReadFirestore();
    }
  }, [selectedCandidate, allMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCandidate, allMessages]);

  const currentCandidateData = selectedCandidate && candidatesMap[selectedCandidate] ? candidatesMap[selectedCandidate] : null;

  const currentMessages = currentCandidateData ? (currentCandidateData.messages || []) : [];

  // send email
  const dispatchMail = async (toEmail, subject, text, candName) => {
    try {
      const res = await fetch('http://localhost:5000/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          subject: subject || 'Message from GlowHome Admin',
          message: text,
          candidateName: candName || 'Candidate'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMailAlert({ type: 'success', text: `email sent to ${toEmail}` });
        return true;
      } else {
        setMailAlert({ type: 'error', text: data.error || 'failed to send email' });
        return false;
      }
    } catch (err) {
      console.warn('mail api error:', err);
      setMailAlert({ type: 'error', text: 'email server error' });
      return false;
    } finally {
      setTimeout(() => setMailAlert(null), 4500);
    }
  };

  // pick emoji
  const handleSelectEmoji = (emoji) => {
    setReplyText((prev) => prev + emoji);
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
  const handleSendReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if ((!text && !selectedFile) || !selectedCandidate || isSending) return;

    const fileToSend = selectedFile;
    setReplyText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowEmojis(false);
    setIsSending(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const candidateName = currentCandidateData?.name || 'Candidate';
    const createdAt = Date.now();

    const newMsgData = {
      text,
      senderRole: 'admin',
      senderName: 'Admin',
      senderEmail: 'admin@gmail.com',
      candidateEmail: selectedCandidate,
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

    setAllMessages((prev) => mergeMessages(prev, [{ ...newMsgData, id: `local_${createdAt}` }]));

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsgData)
      });
      if (res.ok) {
        const saved = await res.json();
        setAllMessages((prev) => mergeMessages(prev, [saved]));
      }
    } catch (err) {
      console.warn('db save message error:', err);
    } finally {
      setIsSending(false);
    }

    if (db) {
      try {
        addDoc(collection(db, 'chats'), newMsgData).catch(() => {});
      } catch (err) {
        console.warn('send error:', err);
      }
    }

    // notify user
    sendNotification({
      title: 'New message from Admin',
      message: text || (fileToSend ? `Sent file: ${fileToSend.name}` : 'New message'),
      recipient: selectedCandidate,
      type: 'chat'
    });
    broadcastChatEvent({
      title: 'New message from Admin',
      message: text || (fileToSend ? `Sent file: ${fileToSend.name}` : 'New message'),
      recipient: selectedCandidate,
      senderRole: 'admin',
      senderName: 'Admin',
      type: 'chat',
      date: dateStr,
      time: timeStr
    });
  };

  // delete message
  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    setAllMessages((prev) => prev.filter((m) => m.id !== msgId));

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
    const newReactions = toggleReaction(msg.reactions, emoji, 'admin');
    setAllMessages((prev) =>
      prev.map((m) => {
        const isMatch = m.id === msg.id || (m.createdAt === msg.createdAt && m.senderRole === msg.senderRole);
        return isMatch ? { ...m, reactions: newReactions } : m;
      })
    );
    saveReactionToFirestore(db, msg, newReactions);
    saveReactionToBackend(msg, newReactions);
    // send reaction notification
    if (newReactions[emoji]?.includes('admin')) {
      const targetEmail = (msg.candidateEmail || selectedCandidate || '').toLowerCase().trim();
      sendNotification({
        title: 'Admin reacted to your message',
        message: msg.text ? `To: "${msg.text}"` : 'New reaction',
        recipient: targetEmail,
        type: 'chat'
      });
      broadcastChatEvent({
        title: 'Admin reacted to your message',
        message: msg.text ? `To: "${msg.text}"` : 'New reaction',
        recipient: targetEmail,
        senderRole: 'admin',
        senderName: 'Admin',
        type: 'chat'
      });
      const mId = msg._id || msg.id;
      if (mId && !String(mId).startsWith('local_')) {
        fetch(`http://localhost:5000/api/messages/${mId}/react`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reactions: newReactions,
            reactorRole: 'admin',
            reactorName: 'Admin',
            isReactionAdd: true
          })
        }).catch(() => {});
      }
    }
  };

  // delete chat
  const handleDeleteChat = async () => {
    if (!selectedCandidate) return;
    const candName = currentCandidateData?.name || selectedCandidate;
    if (!window.confirm(`Are you sure you want to delete all chat history with ${candName}?`)) return;

    setAllMessages((prev) => prev.filter((m) => (m.candidateEmail || '').toLowerCase().trim() !== selectedCandidate));

    try {
      await fetch(`http://localhost:5000/api/messages?email=${encodeURIComponent(selectedCandidate)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('delete chat error:', err);
    }

    if (db) {
      try {
        const q = query(collection(db, 'chats'), where('candidateEmail', '==', selectedCandidate));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => deleteDoc(doc(db, 'chats', d.id)));
      } catch (err) {
        console.warn('firestore clear error:', err);
      }
    }
  };

  // send email
  const handleSendDirectMail = async (e) => {
    e.preventDefault();
    if (!customBody.trim() || !selectedCandidate || isSendingCustomMail) return;

    setIsSendingCustomMail(true);
    const success = await dispatchMail(
      selectedCandidate,
      customSubject.trim() || 'Message from GlowHome Admin',
      customBody.trim(),
      currentCandidateData?.name
    );

    if (success) {
      setCustomSubject('');
      setCustomBody('');
      setShowMailModal(false);
    }
    setIsSendingCustomMail(false);
  };

  // add user
  const handleAddNewCandidate = (e) => {
    e.preventDefault();
    const cleanEmail = newEmail.toLowerCase().trim();
    if (!cleanEmail) return;

    const cleanName = newName.trim() || cleanEmail.split('@')[0];
    candidatesMap[cleanEmail] = {
      email: cleanEmail,
      name: cleanName,
      messages: [],
      unreadCount: 0,
      lastTime: '',
      lastText: 'new conversation',
      lastCreatedAt: Date.now()
    };

    setSelectedCandidate(cleanEmail);
    setNewEmail('');
    setNewName('');
    setShowAddBox(false);
  };

  return (
    <div className="dashboard-panel">
      <div className={`admin-chat-container ${selectedCandidate ? 'has-active-chat' : ''}`}>
        <aside className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-header">
            <div className="admin-chat-header-top">
              <h3>Chats</h3>
              <button
                type="button"
                className="admin-chat-add-toggle-btn"
                onClick={() => setShowAddBox(!showAddBox)}
              >
                {showAddBox ? <X size={13} /> : <Plus size={13} />}
                <span>{showAddBox ? 'close' : 'new chat'}</span>
              </button>
            </div>

            {showAddBox && (
              <form onSubmit={handleAddNewCandidate} className="admin-chat-new-candidate-box">
                <input
                  type="email"
                  className="admin-chat-new-input"
                  placeholder="user email..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="admin-chat-new-input"
                  placeholder="name (optional)..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button type="submit" className="admin-chat-new-submit-btn">
                  start chat
                </button>
              </form>
            )}

            <input
              type="text"
              className="admin-chat-search-input"
              placeholder="search user..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="admin-chat-candidates-list">
            {filteredCandidates.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                <p>no chats found.</p>
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const isActive = cand.email === selectedCandidate;
                return (
                  <div
                    key={cand.email}
                    onClick={() => setSelectedCandidate(cand.email)}
                    className={`admin-chat-candidate-item ${isActive ? 'active' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="admin-chat-candidate-avatar">
                      {(cand.name || 'C').charAt(0).toUpperCase()}
                      {cand.unreadCount > 0 && <span className="admin-chat-avatar-dot"></span>}
                    </div>
                    <div className="admin-chat-candidate-details">
                      <div className="admin-chat-candidate-top">
                        <span className="admin-chat-candidate-name">{cand.name}</span>
                        <span className="admin-chat-candidate-time">{cand.lastTime}</span>
                      </div>
                      <div className="admin-chat-candidate-preview">
                        <p className="admin-chat-preview-text">{cand.lastText}</p>
                        {cand.unreadCount > 0 && (
                          <span className="admin-chat-unread-badge">
                            {cand.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="admin-chat-main">
          {currentCandidateData ? (
            <>
              <div className="admin-chat-main-header">
                <div className="admin-chat-user-header">
                  <button
                    type="button"
                    className="admin-chat-mobile-back-btn"
                    onClick={() => setSelectedCandidate(null)}
                    title="back to chats list"
                  >
                    ←
                  </button>
                  <div className="admin-chat-candidate-avatar">
                    <User size={18} />
                  </div>
                  <div>
                    <h4>{currentCandidateData.name}</h4>
                    <p>{currentCandidateData.email}</p>
                  </div>
                </div>
                <div className="admin-chat-header-actions">
                  <button
                    type="button"
                    className="admin-chat-direct-mail-btn"
                    onClick={() => setShowFileStorage((prev) => !prev)}
                    title="chat files"
                  >
                    <Paperclip size={14} />
                    <span>files ({extractFilesFromMessages(currentMessages).length})</span>
                  </button>
                  <button
                    type="button"
                    className="admin-chat-direct-mail-btn"
                    onClick={() => setShowMailModal(true)}
                    title="compose email"
                  >
                    <Mail size={14} />
                    <span>compose email</span>
                  </button>
                  <button
                    type="button"
                    className="admin-chat-clear-chat-btn"
                    onClick={handleDeleteChat}
                    title="delete entire conversation"
                  >
                    <Trash2 size={14} />
                    <span>delete chat</span>
                  </button>
                  <span className="admin-chat-role-pill">customer</span>
                </div>
              </div>

              <ChatFile
                isOpen={showFileStorage}
                onClose={() => setShowFileStorage(false)}
                files={extractFilesFromMessages(currentMessages)}
                role="admin"
                chatId={selectedCandidate}
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

              {mailAlert && (
                <div className={`admin-chat-mail-alert ${mailAlert.type}`}>
                  {mailAlert.type === 'success' ? <Check size={14} /> : <Mail size={14} />}
                  <span>{mailAlert.text}</span>
                </div>
              )}

              <div className="admin-chat-body">
                {currentMessages.length === 0 ? (
                  <div className="chat-empty-state">
                    <div className="chat-empty-icon">
                      <MessageSquare size={26} />
                    </div>
                    <h4>no messages yet</h4>
                    <p>type a message below to start chatting with {currentCandidateData.name}.</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id || `${msg.createdAt}_${msg.text}`}
                        className={`chat-message-row ${isAdmin ? 'me' : 'other'}`}
                      >
                        <span className="chat-sender-label">
                          {isAdmin ? 'admin' : (msg.candidateName || 'candidate')}
                          {!isAdmin && !msg.read && <span className="chat-new-mark">new</span>}
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
                          currentUserId="admin"
                          onReact={(emoji) => handleToggleReaction(msg, emoji)}
                        />
                        <div className="chat-meta-row">
                          <span className="chat-time-label">
                            {msg.time || msg.date || ''}
                          </span>
                          {msg.sentViaEmail && (
                            <span className="chat-mail-sent-tag">
                              <Mail size={10} />
                              <span>sent to mail</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>

              <div className="admin-chat-footer">
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

                <form onSubmit={handleSendReply} className="admin-chat-input-form">
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
                    className="admin-chat-text-input"
                    placeholder={`type message to ${currentCandidateData.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={(!replyText.trim() && !selectedFile) || isSending}
                    className="admin-chat-send-button"
                  >
                    <Send size={16} />
                    <span>send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="admin-chat-no-selection">
              <div className="admin-chat-no-selection-icon">
                <MessageSquare size={32} />
              </div>
              <h4>select a conversation</h4>
              <p>choose a chat from the left list to start messaging.</p>
            </div>
          )}
        </main>
      </div>

      {showMailModal && (
        <div className="admin-chat-modal-overlay" onClick={() => setShowMailModal(false)}>
          <div className="admin-chat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-chat-modal-header">
              <div className="admin-chat-modal-title">
                <Mail size={18} />
                <h4>Compose Email</h4>
              </div>
              <button
                type="button"
                className="admin-chat-modal-close"
                onClick={() => setShowMailModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSendDirectMail} className="admin-chat-modal-form">
              <div className="admin-chat-modal-field">
                <label>Recipient Email</label>
                <input
                  type="text"
                  value={selectedCandidate || ''}
                  disabled
                  className="admin-chat-modal-input disabled"
                />
              </div>
              <div className="admin-chat-modal-field">
                <label>Email Subject</label>
                <input
                  type="text"
                  placeholder="subject line..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="admin-chat-modal-input"
                />
              </div>
              <div className="admin-chat-modal-field">
                <label>Message Content</label>
                <textarea
                  rows={5}
                  placeholder="type your email message here..."
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  required
                  className="admin-chat-modal-textarea"
                />
              </div>
              <div className="admin-chat-modal-actions">
                <button
                  type="button"
                  className="admin-chat-modal-cancel-btn"
                  onClick={() => setShowMailModal(false)}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={!customBody.trim() || isSendingCustomMail}
                  className="admin-chat-modal-submit-btn"
                >
                  <Mail size={14} />
                  <span>{isSendingCustomMail ? 'sending email...' : 'send email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
