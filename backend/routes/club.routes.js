const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const clubController = require('../controllers/club.controller');

router.post('/:clubId/media', authenticate(), clubController.uploadClubMedia);
router.put('/:clubId', authenticate(), clubController.updateClubProfile);

router.post('/:clubId/events', authenticate(), clubController.createEvent);
router.put('/events/:eventId', authenticate(), clubController.updateEvent);

router.post('/events/:eventId/submit', authenticate(), clubController.submitEventForApproval);
router.post('/events/:eventId/publish', authenticate(), clubController.publishEvent);
router.post('/events/:eventId/cancel', authenticate(), clubController.cancelEvent);

router.get('/:clubId/analytics', authenticate(), clubController.getClubAnalytics);

module.exports = router;
