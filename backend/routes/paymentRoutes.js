const express = require('express');
const router = express.Router();
const { verifyPayment, createOrder } = require('../controllers/paymentController');

// Create a payment order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

module.exports = router;