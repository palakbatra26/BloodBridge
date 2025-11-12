const crypto = require('crypto');
const Razorpay = require('razorpay');

// In a real application, you would store these in environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RSawVU8uXJk0rC';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'nBa1HT8sn9jZew4Vq3SIToA4';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Function to verify Razorpay payment signature
const verifyPayment = (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Create the expected signature
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    // Compare the signatures
    if (digest === razorpay_signature) {
      // Payment is valid
      console.log('Payment verified successfully');
      
      // Here you would typically:
      // 1. Update your database with payment details
      // 2. Send confirmation email
      // 3. Update user's donation history
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      // Payment verification failed
      console.log('Payment verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification'
    });
  }
};

// Function to create a payment order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency: currency,
      receipt: `receipt_order_${Date.now()}`
    };
    
    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during order creation'
    });
  }
};

module.exports = {
  verifyPayment,
  createOrder
};