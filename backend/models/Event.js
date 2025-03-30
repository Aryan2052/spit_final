const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: false },
  timeline: { type: String, required: false },
  location: { type: String, required: true },
  image: { type: String, required: false },
  imageUrl: { type: String, required: false },
  organizer: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['sports', 'tech', 'cultural'],
    default: 'tech'
  },
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);