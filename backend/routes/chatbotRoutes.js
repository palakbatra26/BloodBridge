const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticateClerkToken } = require('../middleware/clerkAuth');

// Public routes (no auth required for chatbot accessibility)
router.post('/message', chatbotController.processMessage);
router.get('/nearby-camps', chatbotController.findNearbyCamps);
router.post('/check-eligibility', chatbotController.checkEligibility);
router.get('/faqs', chatbotController.getFAQs);

// Protected routes
router.get('/conversation/:sessionId', authenticateClerkToken, chatbotController.getConversationHistory);

module.exports = router;
