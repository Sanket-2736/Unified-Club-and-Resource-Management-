const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/event.controller');

router.post('/:eventId/register', authenticate(), controller.registerForEvent);
router.post('/:eventId/complete', authenticate(), controller.completeEvent);

module.exports = router;
