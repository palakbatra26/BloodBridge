const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token and expiration (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token in the response
    res.status(200).json({ 
      message: 'Password reset token generated successfully',
      resetToken: resetToken,
      userId: user._id
    });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ message: 'Error processing password reset request', error: error.message });
  }
};

// Verify password reset token
const verifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }
    
    res.status(200).json({ 
      message: 'Password reset token is valid',
      userId: user._id 
    });
  } catch (error) {
    console.error('Error during password reset token verification:', error);
    res.status(500).json({ message: 'Error verifying password reset token', error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

module.exports = {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword
};