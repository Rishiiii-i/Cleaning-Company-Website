const nodemailer = require('nodemailer');

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

const sendEnquiryStatusEmail = async (enquiry) => {
  try {
    const info = await transporter.sendMail({
      from: `"GlowHome" <${process.env.EMAIL_USER}>`,
      to: enquiry.email,
      subject: `GlowHome - Enquiry Update [${enquiry.status.toUpperCase()}]`,
      html: `
        <h3>GlowHome</h3>
        <p>Dear <b>${enquiry.name}</b>,</p>
        <p>Your enquiry status is now: <b>${enquiry.status.toUpperCase()}</b></p>
        <p><b>Subject:</b> ${enquiry.subject || 'General Enquiry'}</p>
        <p><b>Message:</b> ${enquiry.message}</p>
        <p>Best regards,<br/>GlowHome</p>
      `
    });

    console.log(`Enquiry status email sent to ${enquiry.email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Failed to send email to ${enquiry.email}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEnquiryStatusEmail };
