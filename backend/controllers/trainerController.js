const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const WorkoutLog = require('../models/WorkoutLog');
const FitnessGoal = require('../models/FitnessGoal');
const TrainerFeedback = require('../models/TrainerFeedback');

// @desc    Trainer dashboard stats
// @route   GET /api/trainer/dashboard
const getTrainerDashboard = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ trainer: req.user._id })
      .populate('assignedClients', 'name email weight fitnessLevel');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const clientIds = profile.assignedClients.map(c => c._id);
    const totalSessions = await WorkoutLog.countDocuments({ user: { $in: clientIds } });

    res.json({
      success: true,
      dashboard: {
        trainer: req.user,
        profile,
        totalClients: profile.assignedClients.length,
        totalSessions,
        rating: profile.rating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned clients
// @route   GET /api/trainer/clients
const getClients = async (req, res) => {
  try {
    const { search } = req.query;
    const profile = await TrainerProfile.findOne({ trainer: req.user._id })
      .populate('assignedClients', 'name email weight fitnessLevel avatar createdAt');

    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    let clients = profile.assignedClients;
    if (search) {
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Add workout count per client
    const clientsWithStats = await Promise.all(clients.map(async (client) => {
      const workoutCount = await WorkoutLog.countDocuments({ user: client._id });
      return { ...client.toObject(), workoutCount };
    }));

    res.json({ success: true, clients: clientsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific client details (only if assigned)
// @route   GET /api/trainer/clients/:id
const getClientDetails = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ trainer: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    const isAssigned = profile.assignedClients.some(c => c.toString() === req.params.id);
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Client not assigned to you' });

    const client = await User.findById(req.params.id).select('-password');
    const goals = await FitnessGoal.find({ user: req.params.id });
    const logs = await WorkoutLog.find({ user: req.params.id })
      .populate('exercise', 'name category')
      .sort({ workoutDate: -1 })
      .limit(10);
    const feedback = await TrainerFeedback.find({ client: req.params.id, trainer: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, client, goals, logs, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit feedback for client
// @route   POST /api/trainer/feedback
const submitFeedback = async (req, res) => {
  try {
    const { clientId, rating, category, feedbackText, recommendations } = req.body;

    // Verify client is assigned
    const profile = await TrainerProfile.findOne({ trainer: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    const isAssigned = profile.assignedClients.some(c => c.toString() === clientId);
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Client not assigned to you' });

    const feedback = await TrainerFeedback.create({
      trainer: req.user._id,
      client: clientId,
      rating,
      category,
      feedbackText,
      recommendations
    });

    // Update trainer average rating
    const allFeedback = await TrainerFeedback.find({ trainer: req.user._id });
    const avgRating = allFeedback.reduce((s, f) => s + f.rating, 0) / allFeedback.length;
    await TrainerProfile.findOneAndUpdate(
      { trainer: req.user._id },
      { rating: Math.round(avgRating * 10) / 10, totalRatings: allFeedback.length }
    );

    res.status(201).json({ success: true, message: 'Feedback submitted', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feedback history for a client
// @route   GET /api/trainer/feedback/:clientId
const getFeedbackHistory = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ trainer: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    const isAssigned = profile.assignedClients.some(c => c.toString() === req.params.clientId);
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Client not assigned to you' });

    const feedback = await TrainerFeedback.find({
      trainer: req.user._id,
      client: req.params.clientId
    }).populate('trainer', 'name').sort({ createdAt: -1 });

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrainerDashboard, getClients, getClientDetails, submitFeedback, getFeedbackHistory };
