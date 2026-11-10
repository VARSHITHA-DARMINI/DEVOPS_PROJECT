const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal, updateProgress } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/progress', updateProgress);

module.exports = router;
