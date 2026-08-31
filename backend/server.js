require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
// import custom booking routes
const bookingRoutes = require('./routes/booking');
// import custom payment routes
const paymentRoutes = require('./routes/payment');

// initialize database connection
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// enable cross origin resource sharing
app.use(cors());

// parse json request body
app.use(express.json());

// mount booking routes middleware
app.use('/api', bookingRoutes);
// mount payment routes middleware
app.use('/api', paymentRoutes);

// basic status check route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Server is running and database is connected successfully.' });
});

// sign up route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check input fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // create and save user with plain text password
    const user = new User({ name, email, password });
    await user.save();

    // generate jwt token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // check input fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // check plain text password match
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // generate jwt token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// forgot password route
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email address not registered' });
    }

    res.json({ message: 'reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

// sync auth user details with mongodb
app.post('/api/users/sync', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      user.name = name || user.name;
      if (password) {
        user.password = password;
      }
      await user.save();
    } else {
      user = new User({ name: name || 'User', email, password });
      await user.save();
    }

    res.json({ message: 'user synced successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error during user sync' });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
