const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/me', authenticate(), userController.getProfile);
router.put('/me', authenticate(), userController.updateProfile);
router.put('/reset-password', authenticate(), userController.requestPasswordReset);

module.exports = router;
