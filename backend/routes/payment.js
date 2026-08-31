// create payment route module
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// initialize razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TWFaY8FTrY0x12',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'eroMc3KGfzu8E6sLB6ESCELr'
});

// handle order creation request
router.post('/payments/order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    // find booking by identifier
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    // define order details
    const options = {
      amount: booking.price * 100,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
      notes: {
        serviceType: booking.serviceType,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        notes: booking.notes || 'none'
      }
    };
    // request razorpay order creation
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// handle payment verification request
router.post('/payments/verify', async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // build signature verification payload
    const data = razorpay_order_id + '|' + razorpay_payment_id;
    // generate verification signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'eroMc3KGfzu8E6sLB6ESCELr')
      .update(data.toString())
      .digest('hex');
    // check signature match
    if (expectedSignature === razorpay_signature) {
      // retrieve booking by identifier
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      // fetch payment details from razorpay
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      // store payment properties
      booking.paymentStatus = 'paid';
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpayOrderId = razorpay_order_id;
      booking.paymentMethod = paymentDetails.method;
      // save updated booking database record
      await booking.save();
      res.json({ success: true, booking });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error verifying signature' });
  }
});

module.exports = router;
