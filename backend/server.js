require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
// import custom booking routes
const bookingRoutes = require('./routes/booking');
// import custom payment routes
const paymentRoutes = require('./routes/payment');
// import custom enquiry routes
const enquiryRoutes = require('./routes/enquiry');
// import custom review routes
const reviewRoutes = require('./routes/review');
// import custom service routes
const serviceRoutes = require('./routes/service');
// import custom customer routes
const customerRoutes = require('./routes/customer');
// import custom staff routes
const staffRoutes = require('./routes/staff');
// import custom otp authentication routes
const otpRoutes = require('./routes/otp');
const chatRoutes = require('./routes/chat');

// initialize database connection
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// enable cross origin resource sharing
app.use(cors());

// set body limit
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
// parse json request body
app.use(express.json());

// mount booking routes middleware
app.use('/api', bookingRoutes);
// mount payment routes middleware
app.use('/api', paymentRoutes);
// mount enquiry routes middleware
app.use('/api', enquiryRoutes);
// mount review routes middleware
app.use('/api', reviewRoutes);
// mount service routes middleware
app.use('/api', serviceRoutes);
// mount customer routes middleware
app.use('/api', customerRoutes);
// mount staff routes middleware
app.use('/api', staffRoutes);
// mount otp routes middleware
app.use('/api', otpRoutes);
app.use('/api', chatRoutes);
// mail routes
app.use('/api', require('./routes/mail'));
// message routes
app.use('/api', require('./routes/msg'));
// google ai routes
app.use('/api', require('./routes/google'));

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

    // dispatch 2fa verification code if enabled
    if (user.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const Otp = require('./models/Otp');
      const { sendOtpEmail } = require('./utils/mailer');
      await Otp.deleteMany({ email: user.email.toLowerCase() });
      await Otp.create({
        email: user.email.toLowerCase(),
        otp: code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
      await sendOtpEmail(user.email, code, user.name);
      return res.json({ requires2FA: true, email: user.email, name: user.name });
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

app.get('/api/user/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      photo: user.photo || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch user profile' });
  }
});

app.post('/api/user/profile', async (req, res) => {
  try {
    const { email, name, phone, address, photo } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({ email: email.toLowerCase(), name: name || 'User' });
    }
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (photo !== undefined) user.photo = photo;
    await user.save();
    res.json({
      message: 'profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to update profile' });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

require('./socket');
