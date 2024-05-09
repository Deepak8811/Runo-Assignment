const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/authMiddleware');

const slotController = require('../controllers/slotController');

// Define routes for slot-related operations
router.get('/slots', slotController.getAvailableSlots);
router.post('/slots/register', authenticationMiddleware, slotController.registerSlot);
router.put('/update', authenticationMiddleware, slotController.updateSlot);
// router.get('/slots/registered', slotController.getRegisteredSlots);

module.exports = router;