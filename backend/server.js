const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes"); // Import event routes
const cors = require("cors");
const socialMediaRoutes = require("./routes/socialmediaRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const applicationRoutes = require('./routes/applicationRoutes');
const emailRoutes = require('./routes/emailRoutes');
// ...
app.use('/api/email', emailRoutes);
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
app.use('/api/applications', applicationRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



