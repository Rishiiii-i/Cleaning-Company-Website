const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// get 2fa status for user
router.get('/2fa/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.json({ twoFactorEnabled: Boolean(user.twoFactorEnabled) });
  } catch (err) {
    res.status(500).json({ error: 'server error fetching 2fa status' });
  }
});

// toggle 2fa status for user
router.post('/2fa/toggle', async (req, res) => {
  try {
    const { email, enable } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    user.twoFactorEnabled = Boolean(enable);
    await user.save();
    res.json({ success: true, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ error: 'server error updating 2fa status' });
  }
});

// generate and send otp to registered email
router.post('/2fa/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'user not registered' });
    }

    // generate secure 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // remove previous otps for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // save new otp in database
    await Otp.create({
      email: email.toLowerCase(),
      otp: code,
      expiresAt
    });

    // send otp via nodemailer
    const mailResult = await sendOtpEmail(user.email, code, user.name);
    if (!mailResult.success) {
      return res.status(500).json({ error: 'failed to send email verification code' });
    }

    res.json({ success: true, message: 'verification code sent to your registered email' });
  } catch (err) {
    res.status(500).json({ error: 'server error sending otp' });
  }
});

// verify submitted otp code
router.post('/2fa/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp code are required' });
    }

    // find matching valid otp in database
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp: String(otp).trim(),
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'invalid or expired verification code' });
    }

    // delete used otp record
    await Otp.deleteMany({ email: email.toLowerCase() });

    // fetch user details
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    // generate login session token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'server error verifying otp' });
  }
});

module.exports = router;
