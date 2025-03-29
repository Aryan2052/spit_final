const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Add a new event
router.post("/", async (req, res) => {
  try {
    const { name, description, date, location, image, organizer } = req.body;
    
    if (!name || !description || !date || !location || !image || !organizer) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newEvent = new Event({
      name,
      description,
      date,
      location,
      image,
      organizer
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to add event" });
  }
});

// Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// Update event
router.put("/:id", async (req, res) => {
  try {
    const { name, description, date, location, image, organizer } = req.body;
    
    if (!name || !description || !date || !location || !image || !organizer) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        date,
        location,
        image,
        organizer
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;