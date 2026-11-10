const FitnessGoal = require('../models/FitnessGoal');

// @desc    Get all goals for current user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await FitnessGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const goal = await FitnessGoal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Goal created', goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await FitnessGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const updatedGoal = await FitnessGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    res.json({ success: true, message: 'Goal updated', goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await FitnessGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    await goal.deleteOne();
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { currentValue } = req.body;
    const goal = await FitnessGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.currentValue = currentValue;

    // Auto-complete if target reached
    const progress = Math.abs(currentValue - goal.startValue) / Math.abs(goal.targetValue - goal.startValue);
    if (progress >= 1) goal.status = 'completed';

    await goal.save();
    res.json({ success: true, message: 'Progress updated', goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, updateProgress };
