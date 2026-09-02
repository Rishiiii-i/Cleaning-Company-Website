const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// sample staff list
const defaultStaff = [];

// get all staff route
router.get('/staff', async (req, res) => {
  try {
    const list = await Staff.find().sort({ createdAt: 1 });
    res.json(list.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      role: s.role,
      status: s.status,
      jobsCount: s.jobsCount
    })));
  } catch (err) {
    res.status(500).json({ error: 'failed to get staff' });
  }
});

// add new staff route
router.post('/staff', async (req, res) => {
  try {
    const { name, role, jobsCount } = req.body;
    const worker = new Staff({
      name,
      role: role || 'Standard Cleaner',
      status: 'active',
      jobsCount: Number(jobsCount) || 0
    });
    const saved = await worker.save();
    res.status(201).json({
      id: saved._id.toString(),
      name: saved.name,
      role: saved.role,
      status: saved.status,
      jobsCount: saved.jobsCount
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to add staff' });
  }
});

// update staff status route
router.put('/staff/:id', async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'failed to update staff' });
  }
});

// delete staff route
router.delete('/staff/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'staff removed' });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete staff' });
  }
});

// export staff routes
module.exports = router;
