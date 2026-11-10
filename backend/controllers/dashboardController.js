const WorkoutLog = require('../models/WorkoutLog');
const FitnessGoal = require('../models/FitnessGoal');
const TrainerFeedback = require('../models/TrainerFeedback');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const allLogs = await WorkoutLog.find({ user: userId });
    const goals = await FitnessGoal.find({ user: userId });
    const feedback = await TrainerFeedback.find({ client: userId })
      .populate('trainer', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    const recentLogs = await WorkoutLog.find({ user: userId })
      .populate('exercise', 'name category muscleGroup')
      .sort({ workoutDate: -1 })
      .limit(5);

    const activeGoals = goals.filter(g => g.status === 'active');

    res.json({
      success: true,
      stats: {
        totalWorkouts: allLogs.length,
        totalDuration: allLogs.reduce((s, l) => s + l.duration, 0),
        totalCalories: allLogs.reduce((s, l) => s + l.caloriesBurned, 0),
        activeGoals: activeGoals.length
      },
      recentLogs,
      goals: goals.slice(0, 4),
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Weekly workout activity (bar chart)
// @route   GET /api/dashboard/weekly-activity
const getWeeklyActivity = async (req, res) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const logs = await WorkoutLog.find({
      user: req.user._id,
      workoutDate: { $gte: startOfWeek }
    });

    const activity = days.map((day, i) => {
      const dayLogs = logs.filter(l => new Date(l.workoutDate).getDay() === i);
      return {
        day,
        workouts: dayLogs.length,
        duration: dayLogs.reduce((s, l) => s + l.duration, 0),
        calories: dayLogs.reduce((s, l) => s + l.caloriesBurned, 0)
      };
    });

    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Monthly progress (line chart) - last 6 months
// @route   GET /api/dashboard/monthly-progress
const getMonthlyProgress = async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const logs = await WorkoutLog.find({
      user: req.user._id,
      workoutDate: { $gte: sixMonthsAgo }
    });

    const progress = months.map(m => {
      const mLogs = logs.filter(l => {
        const d = new Date(l.workoutDate);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      });
      return {
        month: m.label,
        workouts: mLogs.length,
        duration: mLogs.reduce((s, l) => s + l.duration, 0),
        calories: mLogs.reduce((s, l) => s + l.caloriesBurned, 0)
      };
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category distribution (doughnut chart)
// @route   GET /api/dashboard/category-distribution
const getCategoryDistribution = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .populate('exercise', 'category');

    const categoryMap = {};
    logs.forEach(log => {
      const cat = log.exercise?.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const distribution = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    res.json({ success: true, distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getWeeklyActivity, getMonthlyProgress, getCategoryDistribution };
