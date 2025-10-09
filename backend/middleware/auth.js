const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authorize admin middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Authorize hospital middleware
const authorizeHospital = (req, res, next) => {
  if (req.user.userType !== 'hospital' && req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Hospital or admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeHospital
};