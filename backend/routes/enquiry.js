const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { sendEnquiryStatusEmail } = require('../mailer');

// get all contact enquiries sorted by newest first
router.get('/enquiries', async (req, res) => {
  try {
    // find all enquiries from database
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching enquiries' });
  }
});

// submit a new contact enquiry from website form
router.post('/enquiries', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // check required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // create new enquiry document
    const newEnquiry = new Enquiry({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Enquiry',
      message
    });

    // save enquiry to database
    await newEnquiry.save();
    res.status(201).json(newEnquiry);
  } catch (err) {
    res.status(500).json({ error: 'Server error submitting enquiry' });
  }
});

// update enquiry status to pending or resolved and send email notification
router.put('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // find enquiry by id
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    // update status if provided
    if (status) {
      enquiry.status = status;
    }

    // save updated enquiry
    await enquiry.save();

    // send status email notification to customer
    const mailResult = await sendEnquiryStatusEmail(enquiry);

    res.json({ ...enquiry.toObject(), id: enquiry._id, mailResult });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating enquiry' });
  }
});

// send or re-send status update email to client
router.post('/enquiries/:id/send-email', async (req, res) => {
  try {
    const { id } = req.params;

    // find enquiry by id
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    // send email notification to customer
    const mailResult = await sendEnquiryStatusEmail(enquiry);
    res.json({ message: 'Status email sent successfully', mailResult });
  } catch (err) {
    res.status(500).json({ error: 'Server error sending email' });
  }
});

// delete an enquiry by id
router.delete('/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // find and delete enquiry
    const deleted = await Enquiry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting enquiry' });
  }
});

module.exports = router;
