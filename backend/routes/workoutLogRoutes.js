const express = require('express');
const router = express.Router();
const { getLogs, createLog, updateLog, deleteLog } = require('../controllers/workoutLogController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getLogs);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;
