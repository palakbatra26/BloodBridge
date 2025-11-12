const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/twofaController');

router.post('/auth/2fa/send', sendOtp);
router.post('/auth/2fa/verify', verifyOtp);

module.exports = router;

