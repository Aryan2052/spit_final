const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const cors = require("cors");
const socialMediaRoutes = require("./routes/socialMediaRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const messageRoutes = require("./routes/messageRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const path = require("path");
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || '*'
    : 'http://localhost:3000',
  credentials: true
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/challenges", challengeRoutes);

// The "catch all" handler for any request that doesn't match one above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
