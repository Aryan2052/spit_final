const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['quiz', 'scavenger', 'social', 'networking', 'sponsor', 'feedback']
  },
  points: { type: Number, required: true, default: 10 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  // For quiz type challenges
  questions: [{
    question: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: String },
    points: { type: Number, default: 5 }
  }],
  // For scavenger hunt challenges
  locations: [{
    name: { type: String },
    description: { type: String },
    hint: { type: String },
    code: { type: String }, // QR code or unique identifier
    points: { type: Number, default: 10 }
  }],
  // For networking challenges
  targetConnections: { type: Number },
  // For sponsor challenges
  sponsorId: { type: String },
  // AI-generated content flag
  isAIGenerated: { type: Boolean, default: false },
  // Metadata for AI-generated challenges
  aiMetadata: {
    prompt: { type: String },
    model: { type: String },
    generatedAt: { type: Date }
  }
}, { timestamps: true });

const UserChallengeProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  challengeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Challenge', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started' 
  },
  progress: { type: Number, default: 0 }, // Percentage of completion
  pointsEarned: { type: Number, default: 0 },
  // For quiz challenges
  answers: [{
    questionIndex: { type: Number },
    userAnswer: { type: String },
    isCorrect: { type: Boolean },
    pointsEarned: { type: Number, default: 0 }
  }],
  // For scavenger hunt challenges
  locationsFound: [{
    locationIndex: { type: Number },
    foundAt: { type: Date },
    pointsEarned: { type: Number, default: 0 }
  }],
  // For networking challenges
  connections: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    connectedAt: { type: Date }
  }],
  completedAt: { type: Date }
}, { timestamps: true });

// Create a compound index to ensure a user has only one progress record per challenge
UserChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const Challenge = mongoose.model("Challenge", ChallengeSchema);
const UserChallengeProgress = mongoose.model("UserChallengeProgress", UserChallengeProgressSchema);

module.exports = { Challenge, UserChallengeProgress };
