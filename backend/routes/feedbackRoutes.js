const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateClerkToken } = require('../middleware/clerkAuth');

router.post('/', authenticateClerkToken, feedbackController.createFeedback);
router.get('/target/:targetType/:targetId', feedbackController.getFeedbackByTarget);
router.get('/user', authenticateClerkToken, feedbackController.getUserFeedback);
router.post('/:id/helpful', feedbackController.markHelpful);
router.delete('/:id', authenticateClerkToken, feedbackController.deleteFeedback);
router.put('/:id', authenticateClerkToken, feedbackController.updateFeedback);

module.exports = router;
