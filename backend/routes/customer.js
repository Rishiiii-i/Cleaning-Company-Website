const express = require('express');
const router = express.Router();
const User = require('../models/User');

// sample customers list
const sampleCustomers = [
  { name: 'Rishiiiiii', email: 'rishi@gmail.com', phone: '9876543211', city: 'Vijayawada' },
  { name: 'Rishi M', email: 'rishimacha00@gmail.com', phone: '9876543212', city: 'Hyderabad' },
  { name: 'Macha Rishi', email: 'rishimacha430@gmail.com', phone: '9876543213', city: 'Bengaluru' }
];

// get all customers route
router.get('/customers', async (req, res) => {
  try {
    const users = await User.find({
      email: { $ne: 'admin@gmail.com' },
      role: { $ne: 'admin' }
    }).select('-password');
    if (users.length === 0) {
      return res.json(sampleCustomers.map((c, i) => ({ id: `c-${i + 1}`, ...c })));
    }
    const list = users.map((u, i) => ({
      id: u._id.toString(),
      name: u.name || `Customer ${i + 1}`,
      email: u.email,
      phone: u.phone || `987654321${i}`,
      city: u.city || 'Andhra Pradesh'
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'failed to get customers' });
  }
});

// add new customer route
router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;
    const dummyPassword = await require('bcryptjs').hash('customer123', 10);
    const newUser = new User({
      name,
      email,
      password: dummyPassword,
      phone: phone || '',
      city: city || ''
    });
    const saved = await newUser.save();
    res.status(201).json({
      id: saved._id.toString(),
      name: saved.name,
      email: saved.email,
      phone: phone || '',
      city: city || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to add customer' });
  }
});

// delete customer route
router.delete('/customers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'customer removed' });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete customer' });
  }
});

// export customer routes
module.exports = router;
