// adminRoute.js (assuming ES Modules support)
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Import all functions from adminController
const {
  adminLogin,
  getTotalUsers,
  filterUsers,
  getRegisteredSlots,
  getVaccineSlotDetails,
  createSlot,

} = adminController;

// Define routes using imported functions

router.post('/login', adminLogin);
router.get('/total-users', getTotalUsers);
router.get('/users', filterUsers);
router.get('/slots', getRegisteredSlots);
router.get('/vaccine-slots', getVaccineSlotDetails);
router.post('/createSlot', createSlot);


module.exports = router;
