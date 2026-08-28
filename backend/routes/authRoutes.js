const express = require('express');
const router = express.Router();
const { signup, login, logout, checkAuth } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', verifyToken, checkAuth);

// Protected RBAC Example Routes
router.get('/user-dashboard', verifyToken, authorizeRoles('user', 'admin'), (req, res) => {
  res.json({ message: 'Welcome User/Admin!' });
});

router.get('/admin-dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin Only!' });
});

module.exports = router;