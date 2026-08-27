const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// get all bookings for a user by email
router.get('/bookings', async (req, res) => {
  try {
    const { email } = req.query;
    // check if email was passed
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }
    // find bookings matching user email
    const bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

// create a new service booking
router.post('/bookings', async (req, res) => {
  try {
    const { userEmail, serviceType, price, date, time, address, notes } = req.body;
    // validate required booking fields
    if (!userEmail || !serviceType || !price || !date || !time || !address) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    // create new booking document
    const newBooking = new Booking({
      userEmail,
      serviceType,
      price,
      date,
      time,
      address,
      notes
    });
    // save booking to database
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating booking' });
  }
});

// update booking details like reschedule or cancel
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status, paymentStatus } = req.body;
    // find booking by id
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    // update status if provided
    if (status) {
      booking.status = status;
    }
    // update payment status if provided
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    // update date if provided
    if (date) {
      booking.date = date;
    }
    // update time if provided
    if (time) {
      booking.time = time;
    }
    // save updated booking
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating booking' });
  }
});

// add user review and rating to a booking
router.put('/bookings/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    // find booking by id
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    // save customer rating and review
    booking.rating = rating;
    booking.review = review;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error adding review' });
  }
});

module.exports = router;
