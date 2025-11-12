const express = require('express');
const router = express.Router();
const { sendNotifications } = require('../controllers/notificationController');

router.post('/notifications/send', sendNotifications);

module.exports = router;

