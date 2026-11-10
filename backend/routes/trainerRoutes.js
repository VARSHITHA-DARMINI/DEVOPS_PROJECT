const express = require('express');
const router = express.Router();
const { getTrainerDashboard, getClients, getClientDetails, submitFeedback, getFeedbackHistory } = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect, authorize('trainer'));
router.get('/dashboard', getTrainerDashboard);
router.get('/clients', getClients);
router.get('/clients/:id', getClientDetails);
router.post('/feedback', submitFeedback);
router.get('/feedback/:clientId', getFeedbackHistory);

module.exports = router;
