const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware"); // Updated import

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return token and user info
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return token and user info
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Logged-in User Route (New)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    // Explicitly structure the response to ensure all fields are included
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile Route
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        username: username || undefined,
        email: email || undefined
      },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (for discussion forum)
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email");
    
    if (!user) {
      return res.status(404).json({ 
        username: "Unknown User", 
        avatar: "UN" 
      });
    }
    
    // Create avatar from username if not available
    const avatar = user.username.substring(0, 2).toUpperCase();
    
    res.json({
      username: user.username,
      avatar: avatar
    });
  } catch (error) {
    // If ID format is invalid, return a default user
    return res.status(200).json({ 
      username: "User" + req.params.id.substring(0, 4), 
      avatar: "U" + req.params.id.substring(0, 1)
    });
  }
});

module.exports = router;
  
  // In the above code, we have created a new route  /me  that returns the logged-in user details. This route uses the  protect  middleware to authenticate the user. 
  // Now, let's update the  server.js  file to include the new route.