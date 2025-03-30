const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  points: { type: Number, required: true, default: 10 },
  criteria: { type: String, required: false },
  category: { 
    type: String, 
    required: true,
    enum: ['networking', 'attendance', 'engagement', 'feedback', 'social']
  }
});

const UserPointsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  points: { type: Number, default: 0 },
  achievements: [{
    achievementId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Achievement' 
    },
    dateEarned: { type: Date, default: Date.now }
  }],
  activities: [{
    type: { 
      type: String, 
      enum: ['attendance', 'feedback', 'networking', 'challenge', 'social', 'sponsor'] 
    },
    description: { type: String },
    points: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }],
  level: { type: Number, default: 1 }
}, { timestamps: true });

// Create a compound index to ensure a user has only one points record per event
UserPointsSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Achievement = mongoose.model("Achievement", AchievementSchema);
const UserPoints = mongoose.model("UserPoints", UserPointsSchema);

module.exports = { Achievement, UserPoints };
