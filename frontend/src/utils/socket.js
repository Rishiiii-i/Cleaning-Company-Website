let ws = null;
const listeners = new Set();
let reconnectTimer = null;
let currentRole = null;
let currentEmail = null;

// get url
function getWsUrl() {
  if (typeof window === 'undefined') return 'ws://localhost:5001';
  const host = window.location.hostname || 'localhost';
  return `ws://${host}:5001`;
}

const recentNotifCache = new Set();

// title
function formatTitle(t) {
  if (!t) return 'New Message';
  let str = String(t);
  if (str.includes('reacted')) {
    str = str.replace(/[👍❤️😂😮😢🔥]/gu, '').replace(/\s+/g, ' ').trim();
    if (str.toLowerCase().endsWith('reacted')) {
      str += ' to your message';
    }
  }
  return str;
}

// show notification
export function showSystemNotification(rawTitle, rawBody, tagKey) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;

  const title = formatTitle(rawTitle);
  const body = rawBody || 'You have a new message';

  const sig = `${title}_${body}`;
  if (recentNotifCache.has(sig)) return;
  recentNotifCache.add(sig);
  setTimeout(() => recentNotifCache.delete(sig), 5000);

  const notifTag = tagKey || ('tag_' + title.replace(/\s+/g, '_'));

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: notifTag
      });
      notif.onclick = () => { try { window.focus(); } catch (e) {} };
    } catch (e) {}
  } else if (Notification.permission === 'default') {
    try {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(title, {
              body: body,
              icon: '/favicon.ico',
              tag: notifTag
            });
          } catch (e) {}
        }
      }).catch(() => {});
    } catch (e) {}
  }
}

// connect socket
export function connectWs(role, email) {
  if (role) currentRole = role;
  if (email) currentEmail = (email || '').toLowerCase().trim();

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    try { Notification.requestPermission().catch(() => {}); } catch (e) {}
  }

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    if (ws.readyState === WebSocket.OPEN && (role || email)) {
      try {
        ws.send(JSON.stringify({ type: 'register', role: currentRole, email: currentEmail }));
      } catch (e) {}
    }
    return ws;
  }

  try {
    const url = getWsUrl();
    ws = new WebSocket(url);

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({ type: 'register', role: currentRole, email: currentEmail }));
      } catch (e) {}
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'chat_notification' && payload.data) {
          const item = payload.data;

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:ws-chat', { detail: item }));
          }

          const effectiveSender = item.isReaction ? item.reactorRole : item.senderRole;
          const isSender = (currentRole === 'admin' && effectiveSender === 'admin') ||
                           (currentRole === 'customer' && effectiveSender === 'candidate');
          if (!isSender) {
            let title = '';
            let preview = '';
            if (item.isReaction) {
              const reactor = effectiveSender === 'admin' ? 'Admin' : (item.reactorName || item.candidateName || item.senderName || 'Customer');
              title = reactor + ' reacted to your message';
              preview = item.text ? 'To: "' + item.text + '"' : 'New reaction';
            } else {
              const senderName = item.senderRole === 'admin'
                ? 'Admin'
                : (item.candidateName || item.senderName || 'Customer');
              title = 'New message from ' + senderName;
              preview = item.text || (item.file ? 'Sent an attachment' : 'New message');
            }
            showSystemNotification(title, preview, 'chat_notif_' + (item.id || item.createdAt || 'recent'));
          }

          for (const callback of listeners) {
            try { callback(item); } catch (err) {}
          }
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      ws = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => { connectWs(currentRole, currentEmail); }, 3000);
    };

    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  } catch (err) {}

  return ws;
}

// listen for messages
export function subscribeChatWs(role, email, onMessage) {
  if (typeof onMessage === 'function') listeners.add(onMessage);
  connectWs(role, email);
  return () => { if (onMessage) listeners.delete(onMessage); };
}
