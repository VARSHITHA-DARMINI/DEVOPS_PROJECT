const express = require('express');
const router = express.Router();
const { getWeeklyReport, getMonthlyReport, getGoalReport, getHistoryReport, exportCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/goals', getGoalReport);
router.get('/history', getHistoryReport);
router.get('/export-csv', exportCSV);

module.exports = router;
