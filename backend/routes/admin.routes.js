const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.post('/login', adminController.adminLogin);

router.get('/users', authenticate(['admin']), adminController.getAllUsers);
router.patch('/users/status', authenticate(['admin']), adminController.toggleUserActiveStatus);
router.patch('/users/role', authenticate(['admin']), adminController.assignUserRole);

router.delete('/users', authenticate(['admin']), adminController.deleteUser);
router.delete('/users/batch', authenticate(['admin']), adminController.deleteUsersByBatch);
router.delete('/users/bulk', authenticate(['admin']), adminController.bulkDeleteUsers);

module.exports = router;
