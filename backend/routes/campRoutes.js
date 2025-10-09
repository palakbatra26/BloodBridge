const express = require('express');
const { getAllBloodCamps, registerForCamp, getCampRegistrations, getRegistrationById, updateRegistrationStatus, deleteRegistration } = require('../controllers/campController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllBloodCamps); // Public endpoint to get all blood camps
router.post('/register', registerForCamp);
router.get('/:campId/registrations', getCampRegistrations);

// Protected routes (user must be logged in)
router.get('/registration/:id', authenticateToken, getRegistrationById);
router.delete('/registration/:id', authenticateToken, deleteRegistration);

// Admin routes
router.put('/registration/:id/status', authenticateToken, authorizeAdmin, updateRegistrationStatus);

module.exports = router;