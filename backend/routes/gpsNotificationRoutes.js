const express = require('express');
const router = express.Router();
const gpsNotificationController = require('../controllers/gpsNotificationController');
const { authenticateClerkToken } = require('../middleware/clerkAuth');

router.post('/create', authenticateClerkToken, gpsNotificationController.createGPSNotification);
router.get('/user', authenticateClerkToken, gpsNotificationController.getUserNotifications);
router.put('/:id/read', authenticateClerkToken, gpsNotificationController.markAsRead);
router.get('/nearby-camps', gpsNotificationController.getNearbyCamps);

module.exports = router;
