const express = require('express');
const { signup, signin, registerDonor } = require('../controllers/authController');
const { requestPasswordReset, verifyPasswordResetToken, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/register-donor', registerDonor);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset-token', verifyPasswordResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;