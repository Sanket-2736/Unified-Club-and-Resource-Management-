const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/event.admin.controller');

router.patch('/:eventId/approval', authenticate(['admin']), controller.updateEventApprovalStatus);
router.patch('/:eventId/changes', authenticate(['admin']), controller.requestEventChanges);
router.patch('/:eventId/cancel', authenticate(['admin']), controller.cancelEvent);
router.get('/:eventId/stats', authenticate(['admin']), controller.getEventStats);

module.exports = router;
