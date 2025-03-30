// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Mock middleware for development that simulates authentication
const mockAuth = (req, res, next) => {
  // Add a mock user to the request
  req.user = {
    id: '1',
    username: 'TestUser'
  };
  next();
};

// Choose which middleware to use based on environment
// For production, use protect. For development, use mockAuth
const auth = process.env.NODE_ENV === 'production' ? protect : mockAuth;

// Helper function to fetch user info
const getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId).select('username');
    if (user && user.username) {
      return {
        username: user.username,
        avatar: user.username.substring(0, 2).toUpperCase()
      };
    }
    
    // Try to get user info from auth routes as a fallback
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        return {
          username: userData.username,
          avatar: userData.avatar
        };
      }
    } catch (fetchError) {
      console.error('Error fetching user from auth route:', fetchError);
    }
    
    // Generate a fallback username when user not found
    return {
      username: "User" + userId.substring(0, 4),
      avatar: "U" + userId.substring(0, 1)
    };
  } catch (error) {
    console.error('Error in getUserInfo:', error);
    // Generate a fallback username when there's an error
    return {
      username: "User" + userId.substring(0, 4),
      avatar: "U" + userId.substring(0, 1)
    };
  }
};

// @desc    Get all messages with user info
// @route   GET /api/messages
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    
    // Enhance messages with user info if missing
    const enhancedMessages = await Promise.all(messages.map(async (message) => {
      const messageObj = message.toObject();
      
      // If username is missing, fetch it
      if (!messageObj.username) {
        const userInfo = await getUserInfo(messageObj.user);
        messageObj.username = userInfo.username;
        messageObj.avatar = userInfo.avatar;
      }
      
      // Enhance replies with user info
      if (messageObj.replies && messageObj.replies.length > 0) {
        messageObj.replies = await Promise.all(messageObj.replies.map(async (reply) => {
          if (!reply.username) {
            const userInfo = await getUserInfo(reply.user);
            reply.username = userInfo.username;
            reply.avatar = userInfo.avatar;
          }
          return reply;
        }));
      }
      
      return messageObj;
    }));
    
    res.json(enhancedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, username, avatar } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Use provided username and avatar if available, otherwise fetch from database
    let messageUsername = username;
    let messageAvatar = avatar;
    
    // If username or avatar not provided, get user info from database
    if (!messageUsername || !messageAvatar) {
      const userInfo = await getUserInfo(req.user.id);
      messageUsername = messageUsername || userInfo.username;
      messageAvatar = messageAvatar || userInfo.avatar;
    }
    
    console.log('Creating message with username:', messageUsername);
    
    const newMessage = new Message({
      content,
      user: req.user.id,
      username: messageUsername,
      avatar: messageAvatar
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add a reply to a message
// @route   POST /api/messages/:id/replies
// @access  Private
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const { content, username, avatar } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Use provided username and avatar if available, otherwise fetch from database
    let replyUsername = username;
    let replyAvatar = avatar;
    
    // If username or avatar not provided, get user info from database
    if (!replyUsername || !replyAvatar) {
      const userInfo = await getUserInfo(req.user.id);
      replyUsername = replyUsername || userInfo.username;
      replyAvatar = replyAvatar || userInfo.avatar;
    }
    
    console.log('Creating reply with username:', replyUsername);
    
    const reply = {
      content,
      user: req.user.id,
      username: replyUsername,
      avatar: replyAvatar
    };
    
    message.replies.push(reply);
    await message.save();
    
    // Fetch the updated message with all user info
    const updatedMessage = await Message.findById(req.params.id);
    const enhancedMessage = updatedMessage.toObject();
    
    // Enhance replies with user info if needed
    if (enhancedMessage.replies && enhancedMessage.replies.length > 0) {
      enhancedMessage.replies = await Promise.all(enhancedMessage.replies.map(async (reply) => {
        if (!reply.username) {
          const replyUserInfo = await getUserInfo(reply.user);
          reply.username = replyUserInfo.username;
          reply.avatar = replyUserInfo.avatar;
        }
        return reply;
      }));
    }
    
    res.status(201).json(enhancedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user owns the message
    if (message.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await Message.deleteOne({ _id: message._id });
    res.json({ message: 'Message removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
