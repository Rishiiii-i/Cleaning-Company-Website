const mongoose = require('mongoose');

// define user database schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  }
}, {
  timestamps: true // track created and updated times
});

module.exports = mongoose.model('User', userSchema);
