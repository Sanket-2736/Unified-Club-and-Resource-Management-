const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/attendance.controller');

router.post('/:eventId', authenticate(['admin', 'organizer']), controller.bulkMarkAttendance);

module.exports = router;
