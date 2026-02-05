const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/resource.controller');

router.get('/', authenticate(), controller.getAvailableResources);
router.post('/:eventId/request', authenticate(), controller.requestResourceForEvent);

router.post('/:eventId/faculty-approve', authenticate(['faculty_coordinator']), controller.facultyApproveResourceRequest);
router.post('/:eventId/admin-approve/:resourceId', authenticate(['admin']), controller.adminApproveResourceAllocation);
router.delete('/:eventId/:resourceId', authenticate(['admin']), controller.removeResourceAllocation);

router.get('/:eventId/:resourceId/letter', authenticate(), controller.generateHallRequestLetter);

module.exports = router;
