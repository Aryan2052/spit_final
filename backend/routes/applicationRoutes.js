const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authMiddleware = require('../middleware/authMiddleware');
 
// Create a new application
router.post('/', async (req, res) => {
  try {
    const { eventId, name, email, phone, reason } = req.body;
    
    if (!eventId || !name || !email || !phone || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const application = await Application.create({
      eventId,
      name,
      email,
      phone,
      reason
    });
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all applications (protected route for admins)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find().populate('eventId', 'name');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;