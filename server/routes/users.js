const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes here require authentication
router.use(requireAuth);

router.post('/sync', userController.syncUser);
router.get('/me', userController.getCurrentUser);

module.exports = router;
