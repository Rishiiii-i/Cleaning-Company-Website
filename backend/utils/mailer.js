const nodemailer = require('nodemailer');

// initialize email transporter
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

// send 2fa verification code email
const sendOtpEmail = async (email, otp, name) => {
  try {
    const sender = process.env.EMAIL_USER || process.env.EMAIL_FROM;
    const info = await transporter.sendMail({
      from: `"GlowHome Security" <${sender}>`,
      to: email,
      subject: `GlowHome - Your 2FA Login Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0284c7; margin-top: 0;">GlowHome Security</h2>
          <p style="color: #334155; font-size: 15px;">Hello ${name || 'Valued Customer'},</p>
          <p style="color: #334155; font-size: 15px;">Your two-factor authentication verification code is:</p>
          <div style="background: #f0f9ff; border: 1px dashed #0284c7; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0369a1;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">&copy; GlowHome Cleaning Services. All rights reserved.</p>
        </div>
      `
    });
    console.log(`2fa otp email sent to ${email} (id: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`failed to send 2fa otp email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendOtpEmail };
