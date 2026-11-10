const express = require('express');
const router = express.Router();
const { getStats, getWeeklyActivity, getMonthlyProgress, getCategoryDistribution } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/weekly-activity', getWeeklyActivity);
router.get('/monthly-progress', getMonthlyProgress);
router.get('/category-distribution', getCategoryDistribution);

module.exports = router;
