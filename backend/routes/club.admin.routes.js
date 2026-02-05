const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/club.admin.controller');

router.patch('/:clubId/approval', authenticate(['admin']), controller.updateClubApprovalStatus);
router.patch('/:clubId/status', authenticate(['admin']), controller.toggleClubStatus);
router.get('/:clubId/report', authenticate(['admin']), controller.getClubActivityReport);
router.post('/:clubId/faculty', authenticate(['admin']), controller.assignFacultyCoordinator);

module.exports = router;
