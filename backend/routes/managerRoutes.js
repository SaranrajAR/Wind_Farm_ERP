const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getAllTurbines,createTurbine,updateTurbine, deleteTurbine } = require('../controllers/managerController');
router.get('/getAllTurbines', verifyToken, getAllTurbines);
router.post('/turbines',verifyToken, createTurbine);
router.put('/turbines/:id',verifyToken, updateTurbine);
router.delete('/turbines/:id', verifyToken, deleteTurbine);

module.exports = router;