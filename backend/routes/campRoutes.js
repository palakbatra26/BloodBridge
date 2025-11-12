const express = require('express');
const { getAllBloodCamps, registerCampRequest, getPendingCamps, approveCamp, rejectCamp, getApprovedCamps, registerForCamp, getCampRegistrations, getRegistrationById, updateRegistrationStatus, deleteRegistration } = require('../controllers/campController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { authenticateClerkToken, authorizeAdmin: clerkAuthorizeAdmin } = require('../middleware/clerkAuth');

const router = express.Router();

// Public routes
router.get('/', getAllBloodCamps); // Public endpoint to get approved blood camps
router.get('/approved', getApprovedCamps);
router.post('/request', registerCampRequest);
router.post('/register', registerForCamp);
router.get('/:campId/registrations', getCampRegistrations);

// Protected routes (user must be logged in)
router.get('/registration/:id', authenticateToken, getRegistrationById);
router.delete('/registration/:id', authenticateToken, deleteRegistration);

// Admin routes
router.put('/registration/:id/status', authenticateClerkToken, clerkAuthorizeAdmin, updateRegistrationStatus);
router.get('/pending', authenticateClerkToken, clerkAuthorizeAdmin, getPendingCamps);
router.patch('/:id/approve', authenticateClerkToken, clerkAuthorizeAdmin, approveCamp);
router.patch('/:id/reject', authenticateClerkToken, clerkAuthorizeAdmin, rejectCamp);

// Development/public fallback to view pending camps without auth (for troubleshooting)
router.get('/pending-public', getPendingCamps);
// Development/public moderation endpoints (fallback when Clerk auth is not configured)
router.patch('/:id/approve-public', approveCamp);
router.patch('/:id/reject-public', rejectCamp);

module.exports = router;
