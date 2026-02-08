const express = require("express");
const { Challenge, UserChallengeProgress } = require("../models/Challenge");
const { UserPoints } = require("../models/Gamification");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all challenges for an event
router.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const challenges = await Challenge.find({
      eventId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    res.json(challenges);
  } catch (err) {
    console.error("Error fetching challenges:", err);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Get a specific challenge
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    res.json(challenge);
  } catch (err) {
    console.error("Error fetching challenge:", err);
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

// Create a new challenge
router.post("/", protect, async (req, res) => {
  try {
    const {
      title, description, eventId, type, points,
      startDate, endDate, questions, locations,
      targetConnections, sponsorId
    } = req.body;

    const newChallenge = new Challenge({
      title,
      description,
      eventId,
      type,
      points,
      startDate,
      endDate,
      isActive: true,
      questions,
      locations,
      targetConnections,
      sponsorId
    });

    const savedChallenge = await newChallenge.save();
    res.status(201).json(savedChallenge);
  } catch (err) {
    console.error("Error creating challenge:", err);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

// Generate a quiz challenge using Gemini API
router.post("/generate-quiz", protect, async (req, res) => {
  try {
    const { eventId, title, description, topic, questionCount = 5 } = req.body;

    if (!eventId || !topic) {
      return res.status(400).json({ error: "Event ID and topic are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a quiz with ${questionCount} multiple-choice questions about "${topic}".
    Format the response as a JSON array with objects containing:
    1. question (the question text)
    2. options (array of 4 possible answers)
    3. correctAnswer (the correct answer, which must be one of the options)
    4. points (number between 5-15 based on difficulty)
    
    Make the questions engaging, educational, and varied in difficulty.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to generate quiz in correct format" });
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Create the challenge
    const newChallenge = new Challenge({
      title: title || `Quiz: ${topic}`,
      description: description || `Test your knowledge about ${topic} with this quiz!`,
      eventId,
      type: 'quiz',
      points: questions.reduce((sum, q) => sum + q.points, 0),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      isActive: true,
      questions,
      isAIGenerated: true,
      aiMetadata: {
        prompt,
        model: "gemini-pro",
        generatedAt: new Date()
      }
    });

    const savedChallenge = await newChallenge.save();
    res.status(201).json(savedChallenge);
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Start a challenge (for a user)
router.post("/:id/start", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if challenge exists
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Check if user already has progress for this challenge
    let progress = await UserChallengeProgress.findOne({
      userId: req.user.id,
      challengeId: id
    });

    if (progress) {
      return res.json(progress);
    }

    // Create new progress
    progress = new UserChallengeProgress({
      userId: req.user.id,
      challengeId: id,
      status: 'in_progress',
      progress: 0,
      pointsEarned: 0
    });

    const savedProgress = await progress.save();
    res.status(201).json(savedProgress);
  } catch (err) {
    console.error("Error starting challenge:", err);
    res.status(500).json({ error: "Failed to start challenge" });
  }
});

// Submit quiz answers
router.post("/:id/submit-quiz", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers must be provided as an array" });
    }

    // Get the challenge
    const challenge = await Challenge.findById(id);
    if (!challenge || challenge.type !== 'quiz') {
      return res.status(404).json({ error: "Quiz challenge not found" });
    }

    // Get or create user progress
    let progress = await UserChallengeProgress.findOne({
      userId: req.user.id,
      challengeId: id
    });

    if (!progress) {
      progress = new UserChallengeProgress({
        userId: req.user.id,
        challengeId: id,
        status: 'in_progress',
        progress: 0,
        pointsEarned: 0,
        answers: []
      });
    }

    // Process answers
    let totalPoints = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = challenge.questions[index];
      const isCorrect = question && answer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      totalPoints += pointsEarned;

      return {
        questionIndex: index,
        userAnswer: answer,
        isCorrect,
        pointsEarned
      };
    });

    // Update progress
    progress.answers = processedAnswers;
    progress.pointsEarned = totalPoints;
    progress.progress = 100; // Quiz is completed in one submission
    progress.status = 'completed';
    progress.completedAt = new Date();

    await progress.save();

    // Add points to user's total
    await addPointsToUser(req.user.id, challenge.eventId, totalPoints, 'challenge', `Completed quiz: ${challenge.title}`);

    res.json({
      progress,
      pointsEarned: totalPoints,
      correctAnswers: processedAnswers.filter(a => a.isCorrect).length,
      totalQuestions: challenge.questions.length
    });
  } catch (err) {
    console.error("Error submitting quiz answers:", err);
    res.status(500).json({ error: "Failed to submit quiz answers" });
  }
});

// Check in at a scavenger hunt location
router.post("/:id/checkin", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { locationCode } = req.body;

    if (!locationCode) {
      return res.status(400).json({ error: "Location code is required" });
    }

    // Get the challenge
    const challenge = await Challenge.findById(id);
    if (!challenge || challenge.type !== 'scavenger') {
      return res.status(404).json({ error: "Scavenger hunt challenge not found" });
    }

    // Find the location
    const locationIndex = challenge.locations.findIndex(loc => loc.code === locationCode);
    if (locationIndex === -1) {
      return res.status(404).json({ error: "Invalid location code" });
    }

    // Get or create user progress
    let progress = await UserChallengeProgress.findOne({
      userId: req.user.id,
      challengeId: id
    });

    if (!progress) {
      progress = new UserChallengeProgress({
        userId: req.user.id,
        challengeId: id,
        status: 'in_progress',
        progress: 0,
        pointsEarned: 0,
        locationsFound: []
      });
    }

    // Check if location already found
    const alreadyFound = progress.locationsFound.some(loc => loc.locationIndex === locationIndex);
    if (alreadyFound) {
      return res.status(400).json({ error: "You've already found this location" });
    }

    // Add location to found locations
    const location = challenge.locations[locationIndex];
    progress.locationsFound.push({
      locationIndex,
      foundAt: new Date(),
      pointsEarned: location.points
    });

    // Update progress
    progress.pointsEarned += location.points;
    progress.progress = (progress.locationsFound.length / challenge.locations.length) * 100;

    if (progress.progress >= 100) {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }

    await progress.save();

    // Add points to user's total
    await addPointsToUser(
      req.user.id,
      challenge.eventId,
      location.points,
      'challenge',
      `Found location in scavenger hunt: ${location.name}`
    );

    res.json({
      progress,
      locationFound: location.name,
      pointsEarned: location.points,
      message: `You found ${location.name}! +${location.points} points`
    });
  } catch (err) {
    console.error("Error checking in at location:", err);
    res.status(500).json({ error: "Failed to check in at location" });
  }
});

// Get user's progress for a challenge
router.get("/:id/progress", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const progress = await UserChallengeProgress.findOne({
      userId: req.user.id,
      challengeId: id
    });

    if (!progress) {
      return res.json({
        userId: req.user.id,
        challengeId: id,
        status: 'not_started',
        progress: 0,
        pointsEarned: 0
      });
    }

    res.json(progress);
  } catch (err) {
    console.error("Error fetching challenge progress:", err);
    res.status(500).json({ error: "Failed to fetch challenge progress" });
  }
});

// Get all challenges a user has participated in
router.get("/user/progress", protect, async (req, res) => {
  try {
    const progress = await UserChallengeProgress.find({
      userId: req.user.id
    }).populate('challengeId');

    res.json(progress);
  } catch (err) {
    console.error("Error fetching user challenge progress:", err);
    res.status(500).json({ error: "Failed to fetch user challenge progress" });
  }
});

// Helper function to add points to user
async function addPointsToUser(userId, eventId, points, activityType, description) {
  try {
    // Find or create user points record
    let userPoints = await UserPoints.findOne({
      userId,
      eventId
    });

    if (!userPoints) {
      userPoints = new UserPoints({
        userId,
        eventId,
        points: 0,
        achievements: [],
        activities: []
      });
    }

    // Add activity and points
    userPoints.activities.push({
      type: activityType,
      description,
      points,
      timestamp: new Date()
    });

    userPoints.points += points;

    // Update level based on points
    userPoints.level = Math.floor(userPoints.points / 100) + 1;

    await userPoints.save();

    return userPoints;
  } catch (err) {
    console.error("Error adding points to user:", err);
    return null;
  }
}

module.exports = router;
