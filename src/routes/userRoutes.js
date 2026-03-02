const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');
const verifyToken = require('../middleware/authMiddleware');

// The validation runs FIRST. If it fails, the controller is never called.
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Add these to your existing userRoutes.js
router.get('/preferences', verifyToken, authController.getPreferences);
router.put('/preferences', verifyToken, authController.updatePreferences);


module.exports = router;