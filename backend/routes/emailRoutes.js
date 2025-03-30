const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/authMiddleware');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Add these to your .env file
    pass: process.env.EMAIL_PASS
  }
});

// Send email route
router.post('/send', protect, async (req, res) => {
  try {
    const { to, subject, body, teamType } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'Email recipient, subject, and body are required' });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: `Email sent successfully to ${teamType} team` });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;