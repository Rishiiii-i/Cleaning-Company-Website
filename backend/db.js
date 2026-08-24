const mongoose = require('mongoose');
require('dotenv').config();

// mongodb atlas connection uri
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowhome';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('connected to mongodb database'))
  .catch((err) => console.error('mongodb connection error', err.message));

module.exports = mongoose;
