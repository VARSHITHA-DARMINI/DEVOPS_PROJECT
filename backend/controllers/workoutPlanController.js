const WorkoutPlan = require('../models/WorkoutPlan');

const getPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user._id })
      .populate('exercises.exercise', 'name category muscleGroup')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: plans.length, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.create({ ...req.body, user: req.user._id });
    const populated = await plan.populate('exercises.exercise', 'name category muscleGroup');
    res.status(201).json({ success: true, message: 'Workout plan created', plan: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const updated = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('exercises.exercise', 'name category muscleGroup');

    res.json({ success: true, message: 'Plan updated', plan: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    await plan.deleteOne();
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
