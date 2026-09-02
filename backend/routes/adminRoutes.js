const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/users', verifyToken, adminController.getEligibleUsers);
router.post('/create-farm', verifyToken, adminController.createWindFarm);
router.get('/farms', verifyToken, adminController.getAllFarmsWithStaff);
router.put('/update-farm/:id', verifyToken, adminController.updateWindFarm);

module.exports = router;