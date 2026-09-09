import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const SYNC_CHANNEL = 'cleaning_chat_notif';

let broadcastChannelInstance = null;

function getSyncChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!broadcastChannelInstance) {
    try {
      broadcastChannelInstance = new BroadcastChannel(SYNC_CHANNEL);
    } catch (e) {}
  }
  return broadcastChannelInstance;
}

const recentMessageCache = new Set();

function isDuplicateMessage(signature) {
  if (!signature) return false;
  if (recentMessageCache.has(signature)) return true;
  recentMessageCache.add(signature);
  setTimeout(() => recentMessageCache.delete(signature), 10000);
  return false;
}

// send message to other tabs
export function broadcastChatEvent(payload) {
  if (!payload) return;

  try {
    const channel = getSyncChannel();
    if (channel) {
      channel.postMessage({ ...payload, _t: Date.now() });
    }
  } catch (e) {}

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('chat_sync_signal', JSON.stringify({ ...payload, _t: Date.now() }));
    }
  } catch (e) {}
}

// listen for chat messages
export function listenUnreadChat(role, userEmail, onCountChange, onNewMessage) {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  let initialChatLoad = true;
  const cleanups = [];

  const handleIncomingMessage = (item) => {
    if (!item) return;

    const sig = `${item.senderRole || ''}_${item.recipient || ''}_${item.message || item.text || ''}_${item.createdAt || item.time || ''}`;
    if (isDuplicateMessage(sig)) {
      return;
    }

    if (role === 'admin') {
      if (item.senderRole === 'admin' || (item.title && item.title.toLowerCase().includes('from admin'))) {
        return;
      }

      const isForAdmin = item.recipient === 'admin' || item.senderRole === 'candidate' || (item.title && item.title.toLowerCase().includes('from '));
      if (!isForAdmin) return;

      const custName = item.candidateName || item.senderName || item.customerName || 'Customer';
      const title = `New message from ${custName}`;
      const message = item.message || item.text || 'New message';
      const time = item.time || item.date || 'Just now';

      if (typeof onNewMessage === 'function') {
        onNewMessage({ title, message, time, sender: custName });
      }

      if (typeof onCountChange === 'function') {
        onCountChange((prev) => (typeof prev === 'number' ? prev + 1 : 1));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:new-notification', {
          detail: { ...item, title, message, date: time, senderRole: 'candidate', recipient: 'admin', type: 'chat', read: false }
        }));
      }
    } else if (role === 'customer') {
      if (item.senderRole === 'candidate' || item.recipient === 'admin') {
        return;
      }

      const isFromAdmin = item.senderRole === 'admin' || (item.title && item.title.toLowerCase().includes('from admin')) || item.recipient !== 'admin';
      if (!isFromAdmin) return;

      const title = 'New message from Admin';
      const message = item.message || item.text || 'New message';
      const time = item.time || item.date || 'Just now';

      if (typeof onNewMessage === 'function') {
        onNewMessage({ title, message, time, sender: 'Admin' });
      }

      if (typeof onCountChange === 'function') {
        onCountChange((prev) => (typeof prev === 'number' ? prev + 1 : 1));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:new-notification', {
          detail: { ...item, title, message, date: time, senderRole: 'admin', recipient: cleanEmail || 'customer', type: 'chat', read: false }
        }));
      }
    }
  };

  // listen to firebase
  if (db) {
    try {
      const chatsRef = collection(db, 'chats');
      const chatQuery = role === 'customer' && cleanEmail
        ? query(chatsRef, where('candidateEmail', '==', cleanEmail))
        : chatsRef;

      const unsubChat = onSnapshot(chatQuery, (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const unreadList = docs.filter((m) => {
          if (m.read) return false;
          return role === 'customer' ? m.senderRole === 'admin' : m.senderRole === 'candidate';
        });

        if (typeof onCountChange === 'function') {
          onCountChange(unreadList.length);
        }

        if (!initialChatLoad && typeof onNewMessage === 'function') {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const isMatch = role === 'customer'
                ? data.senderRole === 'admin' && !data.read
                : data.senderRole === 'candidate' && !data.read;

              if (isMatch) {
                const custName = data.candidateName || data.senderName || 'Customer';
                const senderTitle = role === 'customer'
                  ? 'New message from Admin'
                  : `New message from ${custName}`;
                const textPreview = data.text || (data.file ? 'Sent an attachment' : 'New message');
                handleIncomingMessage({
                  title: senderTitle,
                  message: textPreview,
                  time: data.time || 'Just now',
                  senderName: custName,
                  senderRole: data.senderRole,
                  recipient: data.candidateEmail || 'admin',
                  createdAt: data.createdAt || Date.now()
                });
              }
            }
          });
        }

        initialChatLoad = false;
      }, (error) => {
        console.warn('realtime chat listen error:', error);
      });

      cleanups.push(unsubChat);
    } catch (err) {
      console.warn('firestore chat setup error:', err);
    }

    try {
      const notifsRef = collection(db, 'notifications');
      const recipientKey = role === 'admin' ? 'admin' : cleanEmail;

      if (recipientKey) {
        const notifQuery = query(notifsRef, where('recipient', '==', recipientKey));
        let initialNotifLoad = true;

        const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          if (!initialNotifLoad && typeof onNewMessage === 'function') {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                if (data.type === 'chat' && !data.read) {
                  const custName = data.senderName || data.candidateName || 'Customer';
                  const notifTitle = role === 'customer'
                    ? 'New message from Admin'
                    : `New message from ${custName}`;
                  handleIncomingMessage({
                    title: data.title || notifTitle,
                    message: data.message || '',
                    time: data.date || 'Just now',
                    senderName: custName,
                    senderRole: role === 'customer' ? 'admin' : 'candidate',
                    recipient: recipientKey,
                    createdAt: data.createdAt || Date.now()
                  });
                }
              }
            });
          }
          initialNotifLoad = false;
        }, (error) => {
          console.warn('realtime notification listen error:', error);
        });

        cleanups.push(unsubNotif);
      }
    } catch (err) {
      console.warn('firestore notif setup error:', err);
    }
  }

  // listen to broadcast and storage
  try {
    const channel = getSyncChannel();
    if (channel) {
      const channelHandler = (event) => {
        handleIncomingMessage(event.data);
      };
      channel.addEventListener('message', channelHandler);
      cleanups.push(() => {
        try {
          channel.removeEventListener('message', channelHandler);
        } catch (e) {}
      });
    }
  } catch (e) {}

  const handleStorage = (e) => {
    if (e.key === 'chat_sync_signal' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleIncomingMessage(parsed);
      } catch (err) {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    cleanups.push(() => {
      window.removeEventListener('storage', handleStorage);
    });
  }

  // poll for new messages
  let initialPollDone = false;
  const knownMsgIds = new Set();

  const checkInterval = setInterval(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/messages');
      if (!res.ok) return;
      const allMsgs = await res.json();
      if (!Array.isArray(allMsgs)) return;

      const unreadList = allMsgs.filter((m) => {
        if (m.read) return false;
        if (role === 'admin') {
          return m.senderRole === 'candidate';
        } else {
          if (m.senderRole !== 'admin') return false;
          if (!cleanEmail) return true;
          const msgEmail = (m.candidateEmail || '').toLowerCase().trim();
          return !msgEmail || msgEmail === cleanEmail || cleanEmail.includes(msgEmail.split('@')[0]) || msgEmail.includes(cleanEmail.split('@')[0]);
        }
      });

      if (typeof onCountChange === 'function') {
        onCountChange(unreadList.length);
      }

      if (initialPollDone && typeof onNewMessage === 'function') {
        allMsgs.forEach((m) => {
          const id = m.id || m._id;
          if (!id || knownMsgIds.has(id)) return;
          knownMsgIds.add(id);

          if (!m.read) {
            const custName = m.candidateName || m.senderName || 'Customer';
            const msgTitle = role === 'customer' ? 'New message from Admin' : `New message from ${custName}`;
            handleIncomingMessage({
              title: msgTitle,
              message: m.text || (m.file ? 'Sent an attachment' : 'New message'),
              time: m.time || 'Just now',
              senderName: custName,
              senderRole: m.senderRole,
              recipient: m.candidateEmail || 'admin',
              createdAt: m.createdAt || Date.now(),
              type: 'chat'
            });
          }
        });
      } else {
        allMsgs.forEach((m) => {
          const id = m.id || m._id;
          if (id) knownMsgIds.add(id);
        });
        initialPollDone = true;
      }
    } catch (e) {}
  }, 1500);

  cleanups.push(() => clearInterval(checkInterval));

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (e) {}
    });
  };
}

// mark messages read in firebase
export async function markChatSeenInFirebase(role, userEmail) {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const recipientKey = role === 'admin' ? 'admin' : cleanEmail;

  if (db) {
    try {
      if (recipientKey) {
        const notifsRef = collection(db, 'notifications');
        const notifQuery = query(notifsRef, where('recipient', '==', recipientKey));
        const notifSnap = await getDocs(notifQuery);
        notifSnap.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.type === 'chat') {
            updateDoc(doc(db, 'notifications', d.id), { read: true }).catch(() => {});
          }
        });
      }

      const chatsRef = collection(db, 'chats');
      if (role === 'customer' && cleanEmail) {
        const chatQuery = query(chatsRef, where('candidateEmail', '==', cleanEmail));
        const chatSnap = await getDocs(chatQuery);
        chatSnap.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.senderRole === 'admin') {
            updateDoc(doc(db, 'chats', d.id), { read: true }).catch(() => {});
          }
        });
      } else if (role === 'admin') {
        const chatSnap = await getDocs(chatsRef);
        chatSnap.docs.forEach((d) => {
          const data = d.data();
          if (!data.read && data.senderRole === 'candidate') {
            if (!cleanEmail || (data.candidateEmail || '').toLowerCase().trim() === cleanEmail) {
              updateDoc(doc(db, 'chats', d.id), { read: true }).catch(() => {});
            }
          }
        });
      }
    } catch (err) {
      console.warn('failed to mark chat as read in firestore:', err);
    }
  }
}
