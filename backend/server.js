const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes"); // Import event routes
const cors = require("cors");
const socialMediaRoutes = require("./routes/socialmediaRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const messageRoutes = require("./routes/messageRoutes"); // Import message routes
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
