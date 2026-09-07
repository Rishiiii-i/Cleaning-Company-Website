const express = require('express');
const router = express.Router();

// handle chat messages
router.post('/chat', async (req, res) => {
  // get message from customer
  const { message } = req.body;

  // check if message is empty
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  // create prompt for ollama
  const prompt = `${companyInfo}\n\nCustomer: ${message.trim()}\nGlowBot:`;

  try {
    // send request to local ollama server
    const controller = new AbortController();

    // set request timeout
    const timeout = setTimeout(() => controller.abort(), 60000);

    // send request to ollama
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';

    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        keep_alive: '24h'
      }),
      signal: controller.signal
    });

    // clear timeout
    clearTimeout(timeout);

    // check if ollama response is successful
    if (ollamaResponse.ok) {
      // get response data
      const data = await ollamaResponse.json();

      // send bot response
      return res.json({ reply: data.response ? data.response.trim() : 'How can I assist you further?' });
    }

    console.warn(`Ollama responded with status: ${ollamaResponse.status}`);
    // fallback response if ollama returns an error
    res.json({
      reply: 'We offer Regular House Cleaning at ₹500/hr, Deep Cleaning at ₹900/hr, Office Cleaning at ₹700/hr, and Move-In/Out at ₹3600. Click Schedule Your Cleaning to book!'
    });
  } catch (err) {
    console.error('Ollama connection error:', err.message);
    // fallback response if ollama connection fails
    res.json({
      reply: 'Thank you for reaching out! We offer Regular House Cleaning (₹500/hr), Deep Cleaning (₹900/hr), Office Cleaning (₹700/hr), and Move-In/Out (₹3600). You can book directly on our website or call us anytime.'
    });
  }
});

module.exports = router;
