const WorkoutLog = require('../models/WorkoutLog');

const getLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.workoutDate = {};
      if (startDate) filter.workoutDate.$gte = new Date(startDate);
      if (endDate) filter.workoutDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const logs = await WorkoutLog.find(filter)
      .populate('exercise', 'name category muscleGroup caloriesPerMinute')
      .sort({ workoutDate: -1 })
      .limit(Number(limit));

    // Today's summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await WorkoutLog.find({
      user: req.user._id,
      workoutDate: { $gte: today, $lt: tomorrow }
    });

    const todayStats = {
      count: todayLogs.length,
      totalDuration: todayLogs.reduce((sum, l) => sum + l.duration, 0),
      totalCalories: todayLogs.reduce((sum, l) => sum + l.caloriesBurned, 0),
      completed: todayLogs.filter(l => l.completionStatus === 'completed').length
    };

    res.json({ success: true, count: logs.length, logs, todayStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLog = async (req, res) => {
  try {
    const log = await WorkoutLog.create({ ...req.body, user: req.user._id });
    const populated = await log.populate('exercise', 'name category muscleGroup caloriesPerMinute');
    res.status(201).json({ success: true, message: 'Workout logged', log: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    const updated = await WorkoutLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('exercise', 'name category muscleGroup caloriesPerMinute');

    res.json({ success: true, message: 'Log updated', log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    await log.deleteOne();
    res.json({ success: true, message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLogs, createLog, updateLog, deleteLog };
