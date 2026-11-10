const express = require('express');
const router = express.Router();
const { getExercises, getExercise, createExercise } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);
router.get('/', getExercises);
router.get('/:id', getExercise);
router.post('/', authorize('admin'), createExercise);

module.exports = router;
