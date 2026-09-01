const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// get all reviews sorted by newest first
router.get('/reviews', async (req, res) => {
  try {
    const { email } = req.query;

    // filter by user email if provided
    const filter = email ? { userEmail: email } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching reviews' });
  }
});

// submit a rating and review for a completed service
router.post('/reviews', async (req, res) => {
  try {
    const { bookingId, userEmail, customerName, serviceType, rating, comment } = req.body;

    // check required rating and comment fields
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and review comment are required' });
    }

    // if booking id is given verify and update booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        // verify booking is completed
        if (booking.status !== 'completed') {
          return res.status(400).json({ error: 'Reviews are only allowed for completed services' });
        }
        // save rating and review to booking
        booking.rating = Number(rating);
        booking.review = comment;
        await booking.save();
      }
    }

    // create or update review document
    const newReview = new Review({
      bookingId: bookingId || null,
      userEmail: userEmail || 'customer@gmail.com',
      customerName: customerName || 'Valued Customer',
      serviceType: serviceType || 'Home Cleaning',
      rating: Number(rating),
      comment
    });

    // save review to database
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

// delete a review by id
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // find and remove review
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting review' });
  }
});

module.exports = router;
