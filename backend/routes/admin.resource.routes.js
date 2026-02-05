const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/admin.resource.controller');

router.post('/', authenticate(['admin']), controller.createResource);
router.put('/:resourceId', authenticate(['admin']), controller.updateResource);
router.patch('/:resourceId/availability', authenticate(['admin']), controller.toggleResourceAvailability);

module.exports = router;
