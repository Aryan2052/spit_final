const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route to generate content using Gemini API
router.post('/generate', async (req, res) => {
  try {
    const { prompt, format } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // If JSON format is requested, add instructions to format as JSON
    let finalPrompt = prompt;
    if (format === 'json') {
      finalPrompt = `${prompt}\n\nPlease format your response as valid JSON. Do not include any text before or after the JSON.`;
    }
    
    // Generate content
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    
    // If JSON format was requested, try to validate the response
    if (format === 'json') {
      try {
        // Test if the response is valid JSON
        JSON.parse(text);
      } catch (jsonError) {
        console.error('Invalid JSON response from Gemini:', jsonError);
        // If not valid JSON, try to extract JSON from the text
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          return res.json({ text: jsonMatch[0] });
        }
        // If we can't extract JSON, return a fallback
        return res.json({ 
          text: JSON.stringify([
            {
              question: "How can I prepare for this event?",
              answer: "Come prepared with a laptop and any tools you might need. Review the event description and be ready to collaborate with other participants."
            },
            {
              question: "What will I learn from this event?",
              answer: "You'll gain hands-on experience and knowledge in the subject area, network with peers, and potentially develop new skills relevant to your field."
            }
          ])
        });
      }
    }
    
    res.json({ text });
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      fallback: format === 'json' ? 
        JSON.stringify([
          {
            question: "How can I prepare for this event?",
            answer: "Come prepared with a laptop and any tools you might need. Review the event description and be ready to collaborate with other participants."
          },
          {
            question: "What will I learn from this event?",
            answer: "You'll gain hands-on experience and knowledge in the subject area, network with peers, and potentially develop new skills relevant to your field."
          }
        ]) : 
        "This exciting event brings together professionals and enthusiasts to explore cutting-edge concepts and techniques. Participants will have the opportunity to network, learn from experts, and engage in hands-on activities. The event is designed to foster collaboration and innovation, providing a platform for attendees to share ideas and develop new skills. Whether you're a beginner or an experienced practitioner, this event offers valuable insights and practical knowledge that you can apply in your field. Join us for an enriching experience that combines learning, networking, and fun in a supportive environment."
    });
  }
});

module.exports = router;
