const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  text: {
    type: String,
    default: '',
    trim: true
  },
  senderRole: {
    type: String,
    enum: ['admin', 'candidate'],
    required: true
  },
  senderName: {
    type: String,
    default: 'User'
  },
  senderEmail: {
    type: String,
    default: ''
  },
  candidateEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  candidateName: {
    type: String,
    default: 'Candidate'
  },
  time: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  },
  read: {
    type: Boolean,
    default: false
  },
  sentViaEmail: {
    type: Boolean,
    default: false
  },
  file: {
    url: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    size: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
