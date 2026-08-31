const express = require('express');
const router = express.Router();
const { signup, login, logout, checkAuth } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', verifyToken, checkAuth);

module.exports = router;