const WorkoutLog = require('../models/WorkoutLog');
const FitnessGoal = require('../models/FitnessGoal');

// Weekly Report
const getWeeklyReport = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const logs = await WorkoutLog.find({
      user: req.user._id,
      workoutDate: { $gte: startOfWeek }
    }).populate('exercise', 'name category muscleGroup');

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyActivity = days.map((day, i) => {
      const dayLogs = logs.filter(l => new Date(l.workoutDate).getDay() === i);
      return { day, workouts: dayLogs.length, duration: dayLogs.reduce((s, l) => s + l.duration, 0), calories: dayLogs.reduce((s, l) => s + l.caloriesBurned, 0) };
    });

    // Exercise summary
    const exerciseSummary = {};
    logs.forEach(log => {
      const name = log.exercise?.name || 'Unknown';
      if (!exerciseSummary[name]) exerciseSummary[name] = { name, sessions: 0, totalDuration: 0, totalCalories: 0 };
      exerciseSummary[name].sessions++;
      exerciseSummary[name].totalDuration += log.duration;
      exerciseSummary[name].totalCalories += log.caloriesBurned;
    });

    res.json({
      success: true,
      summary: {
        totalWorkouts: logs.length,
        totalDuration: logs.reduce((s, l) => s + l.duration, 0),
        totalCalories: logs.reduce((s, l) => s + l.caloriesBurned, 0),
        avgDuration: logs.length ? Math.round(logs.reduce((s, l) => s + l.duration, 0) / logs.length) : 0
      },
      dailyActivity,
      exerciseSummary: Object.values(exerciseSummary)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monthly Report
const getMonthlyReport = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const logs = await WorkoutLog.find({
      user: req.user._id,
      workoutDate: { $gte: startOfMonth }
    }).populate('exercise', 'name category');

    // Weekly breakdown within month
    const weeklyData = [0, 1, 2, 3].map(w => {
      const wLogs = logs.filter(l => {
        const day = new Date(l.workoutDate).getDate();
        return day >= w * 7 + 1 && day <= (w + 1) * 7;
      });
      return { week: `Week ${w + 1}`, workouts: wLogs.length, duration: wLogs.reduce((s, l) => s + l.duration, 0), calories: wLogs.reduce((s, l) => s + l.caloriesBurned, 0) };
    });

    // Category distribution
    const catMap = {};
    logs.forEach(l => {
      const cat = l.exercise?.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const user = await require('../models/User').findById(req.user._id);

    res.json({
      success: true,
      summary: {
        monthlyWorkouts: logs.length,
        totalMinutes: logs.reduce((s, l) => s + l.duration, 0),
        totalCalories: logs.reduce((s, l) => s + l.caloriesBurned, 0),
        currentWeight: user?.weight || 0
      },
      weeklyData,
      categoryDistribution: Object.entries(catMap).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Goal Achievement Report
const getGoalReport = async (req, res) => {
  try {
    const goals = await FitnessGoal.find({ user: req.user._id });
    const completed = goals.filter(g => g.status === 'completed');
    const active = goals.filter(g => g.status === 'active');

    res.json({
      success: true,
      summary: {
        totalGoals: goals.length,
        completedGoals: completed.length,
        activeGoals: active.length,
        completionRate: goals.length ? Math.round((completed.length / goals.length) * 100) : 0
      },
      goals: goals.map(g => ({
        ...g.toJSON(),
        progressPercentage: g.progressPercentage
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Workout History Report
const getHistoryReport = async (req, res) => {
  try {
    const { startDate, endDate, search, category } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.workoutDate = {};
      if (startDate) filter.workoutDate.$gte = new Date(startDate);
      if (endDate) filter.workoutDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    let logs = await WorkoutLog.find(filter)
      .populate('exercise', 'name category muscleGroup')
      .sort({ workoutDate: -1 });

    if (search) logs = logs.filter(l => l.exercise?.name?.toLowerCase().includes(search.toLowerCase()));
    if (category && category !== 'All') logs = logs.filter(l => l.exercise?.category === category);

    res.json({
      success: true,
      summary: {
        totalSessions: logs.length,
        totalDuration: logs.reduce((s, l) => s + l.duration, 0),
        totalCalories: logs.reduce((s, l) => s + l.caloriesBurned, 0)
      },
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CSV Export
const exportCSV = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .populate('exercise', 'name category muscleGroup')
      .sort({ workoutDate: -1 });

    const header = 'Date,Exercise,Category,Duration(min),Sets,Reps,Weight(kg),Calories,Status,Notes\n';
    const rows = logs.map(l => {
      return [
        new Date(l.workoutDate).toLocaleDateString(),
        l.exercise?.name || '',
        l.exercise?.category || '',
        l.duration,
        l.sets,
        l.reps,
        l.weight,
        l.caloriesBurned,
        l.completionStatus,
        (l.notes || '').replace(/,/g, ';')
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="workout-history.csv"');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWeeklyReport, getMonthlyReport, getGoalReport, getHistoryReport, exportCSV };
