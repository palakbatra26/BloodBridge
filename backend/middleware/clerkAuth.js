const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

// Authenticate Clerk token middleware
const authenticateClerkToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Authorization header:', authHeader);
  console.log('Extracted token:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Try to verify the Clerk token
    let decodedToken;
    
    // First try the newer verifyToken method
    try {
      decodedToken = await clerk.verifyToken(token);
      console.log('Verified token with verifyToken:', decodedToken);
    } catch (error) {
      // If that fails, try the older tokens.verifyToken method
      console.log('verifyToken failed, trying tokens.verifyToken:', error.message);
      decodedToken = await clerk.tokens.verifyToken(token);
      console.log('Verified token with tokens.verifyToken:', decodedToken);
    }
    
    // Get the user associated with the session
    const user = await clerk.users.getUser(decodedToken.sub);
    
    console.log('User:', user.id, user.emailAddresses[0]?.emailAddress);
    
    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.publicMetadata?.role || 'user' // Default to 'user' if no role is set
    };
    
    console.log('User type:', req.user.userType);
    
    next();
  } catch (error) {
    console.error('Error verifying Clerk token:', error);
    console.error('Token verification failed for token:', token.substring(0, 20) + '...');
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Authorize admin middleware for Clerk users
const authorizeAdmin = (req, res, next) => {
  console.log('Checking admin authorization for user type:', req.user.userType);
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Authorize hospital middleware for Clerk users
const authorizeHospital = (req, res, next) => {
  console.log('Checking hospital authorization for user type:', req.user.userType);
  if (req.user.userType !== 'hospital' && req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Hospital or admin access required' });
  }
  next();
};

module.exports = {
  authenticateClerkToken,
  authorizeAdmin,
  authorizeHospital
};