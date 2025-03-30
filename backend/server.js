const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes"); // Import event routes
const cors = require("cors");
const socialMediaRoutes = require("./routes/socialmediaRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const messageRoutes = require("./routes/messageRoutes"); // Import message routes
const geminiRoutes = require("./routes/geminiRoutes"); // Import Gemini routes
const registrationRoutes = require("./routes/registrationRoutes"); // Import registration routes
const gamificationRoutes = require("./routes/gamificationRoutes"); // Import gamification routes
const challengeRoutes = require("./routes/challengeRoutes"); // Import challenge routes
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes); // Add event routes
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/messages", messageRoutes); // Add message routes
app.use("/api/gemini", geminiRoutes); // Add Gemini routes
app.use("/api/registrations", registrationRoutes); // Add registration routes
app.use("/api/gamification", gamificationRoutes); // Add gamification routes
app.use("/api/challenges", challengeRoutes); // Add challenge routes
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
