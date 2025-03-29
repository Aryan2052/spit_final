const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

router.get("/analysis", async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const attendees = await Feedback.find({ attending: true }).select("eventId suggestions");

    res.json({
      totalFeedbacks,
      averageRating: averageRating[0]?.avgRating || 0,
      attendees,
    });
  } catch (error) {
    console.error("Error fetching feedback analysis:", error);
    res.status(500).json({ error: "Failed to fetch feedback analysis" });
  }
});
// Submit feedback
router.post("/", async (req, res) => {
  const { eventId, rating, eventExperience, speakerInteraction, sessionRelevance, suggestions } = req.body;

  try {
    const feedback = new Feedback({
      eventId,
      rating,
      eventExperience,
      speakerInteraction,
      sessionRelevance,
      suggestions,
    });

    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Get feedback for an event
router.get("/:eventId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ eventId: req.params.eventId });
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

// Analyze sentiment of suggestions
router.get("/sentiment", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ suggestions: { $ne: null } }).select("suggestions");

    const sentimentResults = await Promise.all(
      feedbacks.map(async (feedback) => {
        try {
          const response = await axios.post(
            "https://api.deepseek.ai/v1/sentiment",
            { text: feedback.suggestions },
            {
              headers: {
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            suggestion: feedback.suggestions,
            sentiment: response.data.sentiment, // Assuming the API returns a `sentiment` field
          };
        } catch (error) {
          console.error("Error analyzing sentiment:", error.message);
          return { suggestion: feedback.suggestions, sentiment: "Error" };
        }
      })
    );

    res.json(sentimentResults);
  } catch (error) {
    console.error("Error fetching sentiment analysis:", error);
    res.status(500).json({ error: "Failed to fetch sentiment analysis" });
  }
});

module.exports = router;