const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    eventExperience: { type: Number, required: true, min: 1, max: 5 }, // Changed to Number
    speakerInteraction: { type: Number, required: true, min: 1, max: 5 }, // Changed to Number
    sessionRelevance: { type: Number, required: true, min: 1, max: 5 }, // Changed to Number
    suggestions: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);