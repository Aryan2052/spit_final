const express = require("express");
const { Achievement, UserPoints } = require("../models/Gamification");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get leaderboard for an event
router.get("/leaderboard/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const leaderboard = await UserPoints.find({ eventId })
      .sort({ points: -1 })
      .populate('userId', 'username email')
      .limit(20);

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get user points for an event
router.get("/points/:eventId", protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userPoints = await UserPoints.findOne({
      userId: req.user.id,
      eventId
    }).populate('achievements.achievementId');

    if (!userPoints) {
      return res.json({
        userId: req.user.id,
        eventId,
        points: 0,
        achievements: [],
        activities: [],
        level: 1
      });
    }

    res.json(userPoints);
  } catch (err) {
    console.error("Error fetching user points:", err);
    res.status(500).json({ error: "Failed to fetch user points" });
  }
});

// Add points to user for an activity
router.post("/points", protect, async (req, res) => {
  try {
    const { eventId, points, activityType, description } = req.body;

    if (!eventId || !points || !activityType) {
      return res.status(400).json({ error: "Event ID, points, and activity type are required" });
    }

    // Find or create user points record
    let userPoints = await UserPoints.findOne({
      userId: req.user.id,
      eventId
    });

    if (!userPoints) {
      userPoints = new UserPoints({
        userId: req.user.id,
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

    // Check for achievements
    await checkForAchievements(userPoints);

    res.json(userPoints);
  } catch (err) {
    console.error("Error adding points:", err);
    res.status(500).json({ error: "Failed to add points" });
  }
});

// Get all achievements
router.get("/achievements", async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (err) {
    console.error("Error fetching achievements:", err);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// Create a new achievement
router.post("/achievements", protect, async (req, res) => {
  try {
    const { name, description, points, category, criteria, image } = req.body;

    const newAchievement = new Achievement({
      name,
      description,
      points,
      category,
      criteria,
      image
    });

    const savedAchievement = await newAchievement.save();
    res.status(201).json(savedAchievement);
  } catch (err) {
    console.error("Error creating achievement:", err);
    res.status(500).json({ error: "Failed to create achievement" });
  }
});

// Generate achievements using Gemini API
router.post("/generate-achievements", protect, async (req, res) => {
  try {
    const { eventName, eventDescription, category, count = 3 } = req.body;

    if (!eventName || !category) {
      return res.status(400).json({ error: "Event name and category are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate ${count} achievement badges for an event called "${eventName}" with description "${eventDescription || 'A tech event'}". 
    The achievements should be for the category: ${category} (one of: networking, attendance, engagement, feedback, social).
    Format the response as a JSON array with objects containing:
    1. name (short, catchy title)
    2. description (1-2 sentences explaining how to earn it)
    3. points (number between 10-50)
    4. criteria (short technical description of how this is earned)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to generate achievements in correct format" });
    }

    const achievements = JSON.parse(jsonMatch[0]);
    
    // Add category to each achievement
    achievements.forEach(achievement => {
      achievement.category = category;
    });

    res.json(achievements);
  } catch (err) {
    console.error("Error generating achievements:", err);
    res.status(500).json({ error: "Failed to generate achievements" });
  }
});

// Helper function to check for achievements
async function checkForAchievements(userPoints) {
  try {
    // Get all achievements
    const achievements = await Achievement.find();
    
    // Check each achievement
    for (const achievement of achievements) {
      // Skip if user already has this achievement
      const hasAchievement = userPoints.achievements.some(
        a => a.achievementId.toString() === achievement._id.toString()
      );
      
      if (hasAchievement) continue;
      
      // Check criteria based on category
      let earned = false;
      
      switch (achievement.category) {
        case 'attendance':
          // Check if user has attended enough events
          const attendanceActivities = userPoints.activities.filter(a => a.type === 'attendance');
          earned = attendanceActivities.length >= 3;
          break;
          
        case 'networking':
          // Check if user has networked with enough people
          const networkingActivities = userPoints.activities.filter(a => a.type === 'networking');
          earned = networkingActivities.length >= 5;
          break;
          
        case 'engagement':
          // Check if user has enough engagement points
          const engagementPoints = userPoints.activities
            .filter(a => a.type === 'challenge' || a.type === 'feedback')
            .reduce((sum, a) => sum + a.points, 0);
          earned = engagementPoints >= 50;
          break;
          
        case 'feedback':
          // Check if user has provided enough feedback
          const feedbackActivities = userPoints.activities.filter(a => a.type === 'feedback');
          earned = feedbackActivities.length >= 3;
          break;
          
        case 'social':
          // Check if user has enough social activities
          const socialActivities = userPoints.activities.filter(a => a.type === 'social');
          earned = socialActivities.length >= 3;
          break;
      }
      
      // Award achievement if earned
      if (earned) {
        userPoints.achievements.push({
          achievementId: achievement._id,
          dateEarned: new Date()
        });
        
        userPoints.points += achievement.points;
      }
    }
    
    await userPoints.save();
    return userPoints;
  } catch (err) {
    console.error("Error checking for achievements:", err);
    return userPoints;
  }
}

module.exports = router;
