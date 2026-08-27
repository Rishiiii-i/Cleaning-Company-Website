const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: ['pending', 'scheduled', 'completed', 'cancelled']
  },
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'paid']
  },
  rating: {
    type: Number,
    default: null
  },
  review: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
