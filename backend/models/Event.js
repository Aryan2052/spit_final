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
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);