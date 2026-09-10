const { WebSocketServer, WebSocket } = require('ws');

const WS_PORT = process.env.WS_PORT || 5001;
const clients = new Set();
let wss = null;

// start server
function startWs() {
  if (wss) return wss;
  try {
    wss = new WebSocketServer({ port: WS_PORT });

    wss.on('connection', (ws) => {
      ws.isAlive = true;
      clients.add(ws);

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('message', (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.type === 'register') {
            ws.clientRole = data.role || null;
            ws.clientEmail = (data.email || '').toLowerCase().trim();
          }
        } catch (e) {}
      });

      ws.on('close', () => clients.delete(ws));
      ws.on('error', () => clients.delete(ws));
    });

    const interval = setInterval(() => {
      for (const ws of clients) {
        if (!ws.isAlive) {
          clients.delete(ws);
          ws.terminate();
          continue;
        }
        ws.isAlive = false;
        ws.ping();
      }
    }, 30000);

    wss.on('close', () => clearInterval(interval));
    console.log(`websocket server running on port ${WS_PORT}`);
    return wss;
  } catch (err) {
    console.error('websocket server failed to start:', err.message);
    return null;
  }
}

// send to clients
function broadcastChat(messageData) {
  if (!messageData) return;

  const payload = JSON.stringify({
    type: 'chat_notification',
    data: messageData
  });

  const senderRole = messageData.isReaction ? messageData.reactorRole : messageData.senderRole;
  const targetEmail = (messageData.candidateEmail || '').toLowerCase().trim();

  for (const ws of clients) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    try {
      if (senderRole === 'candidate' && ws.clientRole === 'admin') {
        ws.send(payload);
      } else if (senderRole === 'candidate' && ws.clientRole === 'customer' && ws.clientEmail === targetEmail) {
        ws.send(payload);
      } else if (senderRole === 'admin' && ws.clientRole === 'customer' && ws.clientEmail === targetEmail) {
        ws.send(payload);
      } else if (senderRole === 'admin' && ws.clientRole === 'admin') {
        ws.send(payload);
      }
    } catch (e) {}
  }
}

// start server
startWs();

module.exports = { startWs, broadcastChat };
