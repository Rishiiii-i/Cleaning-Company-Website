const express = require('express');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// extract text
const extractText = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.reply || item.text || item.option || item.suggestion || item.message || item.content || Object.values(item).find(v => typeof v === 'string') || '';
  }
  return String(item);
};

// google
const generateWithGoogle = async (messages = [], candidateName = 'Customer', isLastFromAdmin = false) => {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || GOOGLE_API_KEY;
  if (!apiKey) return null;

  const recentMsgs = messages.slice(-5).map(m => {
    const role = m.senderRole === 'admin' ? 'Admin' : candidateName;
    return `${role}: ${m.text || ''}`;
  }).join('\n');

  const lastMsg = messages[messages.length - 1]?.text || '';
  let promptTarget = '';
  if (isLastFromAdmin) {
    promptTarget = `Admin just sent: "${lastMsg}". Generate 3 short next-step suggestions (under 10 words each) for Admin to follow up.`;
  } else {
    promptTarget = `Customer asked: "${lastMsg}". Generate 3 direct, professional reply options (under 10 words each) for Admin to respond.`;
  }

  const prompt = `You are an AI assistant for GlowHome professional cleaning service. Pricing: Standard INR 120, Deep INR 200, Move INR 280, Office INR 350. Cleaners bring all supplies and equipment. Cash on delivery is available. ${promptTarget}\nChat context:\n${recentMsgs}\nReturn strictly valid JSON: {"replies": ["option 1", "option 2", "option 3"]}. Under 10 words each. No emojis.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    }),
    signal: AbortSignal.timeout(6000)
  });

  if (!response.ok) return null;
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = JSON.parse(rawText);
  const rawList = parsed.replies || parsed.suggestions || Object.values(parsed).find(v => Array.isArray(v)) || [];
  if (Array.isArray(rawList) && rawList.length > 0) {
    return rawList
      .map(extractText)
      .map(r => String(r).trim())
      .filter(r => r.length > 0);
  }
  return null;
};

// status
router.get('/google/status', async (req, res) => {
  return res.json({ online: true, google: !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || GOOGLE_API_KEY) });
});

// replies
router.post('/google/smart-replies', async (req, res) => {
  try {
    const { messages = [], candidateName = 'Customer' } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'no messages provided' });
    }

    const lastMsg = messages[messages.length - 1];
    const isLastFromAdmin = lastMsg.senderRole === 'admin';

    // google
    const googleReplies = await generateWithGoogle(messages, candidateName, isLastFromAdmin);
    if (googleReplies && googleReplies.length >= 2) {
      return res.json({
        success: true,
        replies: googleReplies.slice(0, 3)
      });
    }

    return res.json({ success: false, error: 'no replies generated' });
  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
});

module.exports = router;
