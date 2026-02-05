const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/feedback.controller');

router.post('/:eventId', authenticate(), controller.submitEventFeedback);
router.get('/:eventId', authenticate(), controller.getEventFeedbacks);
router.get('/club/:clubId', authenticate(), controller.getClubFeedbackAnalytics);
router.patch('/:eventId/toggle', authenticate(['admin']), controller.toggleEventFeedback);

module.exports = router;
