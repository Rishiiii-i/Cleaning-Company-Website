const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// setup mail transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// send email route
router.post('/mail/send', async (req, res) => {
  try {
    const { to, subject, message, candidateName } = req.body;
    const recipient = to || req.body.email || req.body.candidateEmail;

    // check required fields
    if (!recipient || !message) {
      return res.status(400).json({ error: 'recipient email and message are required' });
    }

    const sender = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'admin@gmail.com';
    const mailSubject = subject || 'Message from GlowHome Admin';

    // send email
    const info = await transporter.sendMail({
      from: `"GlowHome Admin" <${sender}>`,
      to: recipient,
      subject: mailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #0284c7; margin: 0; font-size: 20px;">GlowHome Admin</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Official Candidate Communication</p>
          </div>
          <p style="color: #334155; font-size: 15px; margin-bottom: 12px;">Hello <b>${candidateName || 'Candidate'}</b>,</p>
          <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">You have received a new message from the GlowHome Administrator:</p>
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 6px; padding: 16px; margin: 16px 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">You can reply to this message directly in your dashboard chat or reply to this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">&copy; GlowHome Cleaning Services. All rights reserved.</p>
        </div>
      `
    });

    console.log(`email sent successfully to ${recipient} (message id: ${info.messageId})`);
    return res.json({ success: true, messageId: info.messageId, recipient });
  } catch (err) {
    console.error(`email send failed for ${req.body.to}:`, err.message);
    return res.status(500).json({ error: err.message || 'failed to send email' });
  }
});

// export router
module.exports = router;
