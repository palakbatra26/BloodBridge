const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: String,
    confidence: Number
  }],
  userLocation: {
    latitude: Number,
    longitude: Number,
    city: String,
    state: String
  },
  metadata: {
    userAgent: String,
    platform: String,
    language: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
