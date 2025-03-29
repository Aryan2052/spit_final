const express = require("express");
const axios = require("axios");

const router = express.Router();

// Use the DeepSeek API key from the environment variables
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

// Generate Social Media Post Content Using DeepSeek
router.post("/generate-post", async (req, res) => {
  const { eventName, description, platform } = req.body;

  try {
    const prompt = `Generate a professional and engaging social media post for ${platform} about the event "${eventName}". Description: ${description}`;
    const response = await axios.post(
      "https://api.deepseek.ai/v1/generate",
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].text.trim();
    res.json({ content });
  } catch (error) {
    console.error("Error using DeepSeek API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content using DeepSeek API" });
  }
});

module.exports = router;