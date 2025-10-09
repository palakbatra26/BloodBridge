const express = require('express');
const { addBloodCamp, getAllBloodCamps, updateBloodCamp, deleteBloodCamp } = require('../controllers/adminController');
const { authenticateClerkToken, authorizeAdmin } = require('../middleware/clerkAuth');

const router = express.Router();

// Apply Clerk authentication and admin authorization middleware to all routes
router.use(authenticateClerkToken, authorizeAdmin);

router.post('/camps', addBloodCamp);
router.get('/camps', getAllBloodCamps);
router.put('/camps/:id', updateBloodCamp);
router.delete('/camps/:id', deleteBloodCamp);

module.exports = router;