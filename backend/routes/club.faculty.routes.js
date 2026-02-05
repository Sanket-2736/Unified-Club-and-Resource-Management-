const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const controller = require('../controllers/club.faculty.controller');

router.get('/:clubId', authenticate(['faculty_coordinator']), controller.getClubDetails);
router.patch('/:clubId/members/:userId', authenticate(['faculty_coordinator']), controller.toggleClubMemberStatus);
router.delete('/:clubId/members/:userId', authenticate(['faculty_coordinator']), controller.removeClubMember);

router.get('/:clubId/applications', authenticate(['faculty_coordinator']), controller.getMembershipApplications);
router.patch('/applications/:applicationId', authenticate(['faculty_coordinator']), controller.reviewMembershipApplication);

router.post('/:clubId/transition', authenticate(['faculty_coordinator']), controller.transitionClubCommittee);

module.exports = router;
