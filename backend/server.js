require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize database connection
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// enable cross origin resource sharing
app.use(cors());

// parse json request body
app.use(express.json());

// Basic connection test route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Server is running and database is connected successfully.' });
});

// start server on specified port
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
