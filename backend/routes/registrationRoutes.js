const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const router = express.Router();

// Register for an event
router.post("/", auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is already registered for this event
    const existingRegistration = await Registration.findOne({
      userId: req.user.id,
      eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ error: "You are already registered for this event" });
    }

    // Create new registration
    const newRegistration = new Registration({
      userId: req.user.id,
      eventId,
      status: 'confirmed'
    });

    const savedRegistration = await newRegistration.save();
    
    res.status(201).json({
      message: "Successfully registered for the event",
      registration: savedRegistration
    });
  } catch (err) {
    console.error("Error registering for event:", err);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

// Get all events a user is registered for
router.get("/my-events", auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user.id })
      .populate('eventId')
      .sort({ registrationDate: -1 });
    
    // Extract just the event data
    const events = registrations.map(reg => reg.eventId);
    
    res.json(events);
  } catch (err) {
    console.error("Error fetching registered events:", err);
    res.status(500).json({ error: "Failed to fetch registered events" });
  }
});

// Check if user is registered for a specific event
router.get("/check/:eventId", auth, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      userId: req.user.id,
      eventId: req.params.eventId
    });
    
    res.json({ isRegistered: !!registration });
  } catch (err) {
    console.error("Error checking registration status:", err);
    res.status(500).json({ error: "Failed to check registration status" });
  }
});

// Cancel registration
router.delete("/:id", auth, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await Registration.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Registration cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling registration:", err);
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});

module.exports = router;
