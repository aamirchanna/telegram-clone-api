const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controllers');

// List all users (exclude current user)
router.get('/list', authMiddleware, userController.listUsers);

module.exports = router;
