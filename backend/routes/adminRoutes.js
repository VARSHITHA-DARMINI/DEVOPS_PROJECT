const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, getTrainers, toggleStatus, assignTrainer, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/trainers', getTrainers);
router.put('/users/:id/status', toggleStatus);
router.put('/users/:id/assign-trainer', assignTrainer);
router.delete('/users/:id', deleteUser);

module.exports = router;
