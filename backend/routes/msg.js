const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// get messages
router.get('/messages', async (req, res) => {
  const qEmail = req.query.email;
  const qRole = req.query.role || (qEmail ? 'customer' : 'admin');
  try {
    const qFilter = qEmail ? { candidateEmail: qEmail.toLowerCase().trim() } : {};
    if (qRole === 'admin') {
      qFilter.deletedForAdmin = { $ne: true };
    } else {
      qFilter.deletedForCustomer = { $ne: true };
    }
    const msgs = await Chat.find(qFilter).sort({ createdAt: 1 });
    return res.json(msgs.map((m) => ({ id: m._id.toString(), ...m.toObject() })));
  } catch (e) {}
  try {
    const { email } = req.query;
    const filter = email ? { candidateEmail: email.toLowerCase().trim() } : {};
    const messages = await Chat.find(filter).sort({ createdAt: 1 });
    res.json(messages.map((m) => ({ id: m._id.toString(), ...m.toObject() })));
  } catch (err) {
    res.status(500).json({ error: 'failed to get messages' });
  }
});

// save message
router.post('/messages', async (req, res) => {
  try {
    const { text, senderRole, senderName, senderEmail, candidateEmail, candidateName, time, date, createdAt, sentViaEmail, file } = req.body;

    // check required fields
    if ((!text && !file) || !candidateEmail) {
      return res.status(400).json({ error: 'message content and candidateEmail are required' });
    }

    // create new message
    const newMsg = new Chat({
      text: (text || '').trim(),
      senderRole: senderRole || 'candidate',
      senderName: senderName || 'User',
      senderEmail: senderEmail || '',
      candidateEmail: candidateEmail.toLowerCase().trim(),
      candidateName: candidateName || 'Candidate',
      time: time || '',
      date: date || '',
      createdAt: createdAt || Date.now(),
      read: false,
      sentViaEmail: Boolean(sentViaEmail),
      file: file || null
    });

    const saved = await newMsg.save();
    // send message
    try {
      const { broadcastChat } = require('../socket');
      broadcastChat({ id: saved._id.toString(), ...saved.toObject() });
    } catch (e) {}
    res.status(201).json({ id: saved._id.toString(), ...saved.toObject() });
  } catch (err) {
    res.status(500).json({ error: 'failed to save message' });
  }
});

// mark read
router.put('/messages/read', async (req, res) => {
  try {
    const { candidateEmail, senderRole } = req.body;
    if (candidateEmail) {
      await Chat.updateMany(
        { candidateEmail: candidateEmail.toLowerCase().trim(), senderRole: senderRole || 'candidate' },
        { read: true }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'failed to mark messages read' });
  }
});

// update reactions
router.put('/messages/:id/react', async (req, res) => {
  try {
    const { id } = req.params;
    const { reactions } = req.body;
    if (id && !id.startsWith('local_')) {
      await Chat.findByIdAndUpdate(id, { reactions: reactions || {} });
      // send reaction
      try {
        if (req.body?.isReactionAdd || req.body?.reactorRole) {
          const docObj = await Chat.findById(id);
          if (docObj) {
            const { broadcastChat } = require('../socket');
            broadcastChat({
              id: docObj._id.toString(),
              ...docObj.toObject(),
              isReaction: true,
              reactorRole: req.body?.reactorRole || (docObj.senderRole === 'candidate' ? 'admin' : 'candidate'),
              reactorName: req.body?.reactorName || ''
            });
          }
        }
      } catch (e) {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'failed to update reaction' });
  }
});

// delete single message
router.delete('/messages/:id', async (req, res) => {
  const delRole = req.query.role || req.body?.role;
  if (delRole && req.params.id && !req.params.id.startsWith('local_')) {
    try {
      const field = delRole === 'admin' ? { deletedForAdmin: true } : { deletedForCustomer: true };
      await Chat.findByIdAndUpdate(req.params.id, field);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'failed to delete message' });
    }
  }
  try {
    const { id } = req.params;
    if (!id.startsWith('local_')) {
      await Chat.findByIdAndDelete(id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete message' });
  }
});

// delete entire chat
router.delete('/messages', async (req, res) => {
  const clearRole = req.query.role || req.body?.role;
  const targetEmail = req.query.email;
  if (clearRole && targetEmail) {
    try {
      const field = clearRole === 'admin' ? { deletedForAdmin: true } : { deletedForCustomer: true };
      await Chat.updateMany({ candidateEmail: targetEmail.toLowerCase().trim() }, { $set: field });
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'failed to delete chat' });
    }
  }
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    await Chat.deleteMany({ candidateEmail: email.toLowerCase().trim() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete chat' });
  }
});

// export router
module.exports = router;
