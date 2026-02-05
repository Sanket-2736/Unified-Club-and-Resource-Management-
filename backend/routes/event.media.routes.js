const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/event.media.controller');

router.post('/:eventId/gallery', authenticate(), controller.uploadEventGallery);
router.post('/:eventId/gallery/bulk', authenticate(), controller.bulkUploadEventGallery);

module.exports = router;
