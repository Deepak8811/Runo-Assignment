const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes for user-related operations
router.post('/register', userController.register);
router.post('/login', userController.login);



module.exports = router;
