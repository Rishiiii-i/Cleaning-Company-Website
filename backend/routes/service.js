const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// default list of services
const initialServices = [
  {
    name: 'Standard Cleaning',
    category: 'Residential',
    price: 120,
    desc: 'covers kitchen cleaning, bathrooms, bedroom dusting, and floor vacuuming.',
    status: 'active'
  },
  {
    name: 'Deep Cleaning',
    category: 'Deep Clean',
    price: 200,
    desc: 'thorough scrub including inside cabinets, oven cleaning, tiles, and glass windows.',
    status: 'active'
  },
  {
    name: 'Move In/Out Cleaning',
    category: 'Relocation',
    price: 280,
    desc: 'complete sanitization of empty apartments for relocation inspections.',
    status: 'active'
  },
  {
    name: 'Office Cleaning',
    category: 'Commercial',
    price: 350,
    desc: 'specialized disinfection for desk grids, conference halls, and public corporate lobbies.',
    status: 'active'
  }
];

// get all services route
router.get('/services', async (req, res) => {
  try {
    const total = await Service.countDocuments();
    // add default services if table is empty
    if (total === 0) {
      await Service.insertMany(initialServices);
    }
    const list = await Service.find().sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'failed to get services' });
  }
});

// add new service route
router.post('/services', async (req, res) => {
  try {
    const { name, category, price, desc, status } = req.body;
    const newService = new Service({
      name,
      category: category || 'General Cleaning',
      price: Number(price),
      desc: desc || '',
      status: status || 'active'
    });
    const saved = await newService.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'failed to save service' });
  }
});

// update service price and details
router.put('/services/:id', async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'failed to update service' });
  }
});

// delete service route
router.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'service removed' });
  } catch (err) {
    res.status(500).json({ error: 'failed to delete service' });
  }
});

// export service routes
module.exports = router;
