// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true 
  },
  user: { 
    type: String,  // User ID reference
    required: true 
  },
  username: {
    type: String,
    required: false  // Now optional, will be fetched from User model
  },
  avatar: {
    type: String,
    required: false  // Now optional, will be fetched from User model
  },
  replies: [{
    content: { type: String, required: true },
    user: { type: String, required: true },  // User ID reference
    username: { type: String, required: false },  // Now optional
    avatar: { type: String, required: false },  // Now optional
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
