const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const WorkoutLog = require('../models/WorkoutLog');
const FitnessGoal = require('../models/FitnessGoal');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    const totalWorkouts = await WorkoutLog.countDocuments();
    const activeGoals = await FitnessGoal.countDocuments({ status: 'active' });

    res.json({
      success: true,
      stats: { totalUsers, totalTrainers, totalWorkouts, activeGoals }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(filter)
      .select('-password')
      .populate('assignedTrainer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainers with their profiles
// @route   GET /api/admin/trainers
const getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    const profiles = await TrainerProfile.find()
      .populate('trainer', 'name email isActive')
      .populate('assignedClients', 'name');

    const trainersWithProfiles = trainers.map(t => {
      const profile = profiles.find(p => p.trainer?._id?.toString() === t._id.toString());
      return { ...t.toObject(), profile: profile || null };
    });

    res.json({ success: true, trainers: trainersWithProfiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
const toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot modify admin accounts' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `Account ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign trainer to user
// @route   PUT /api/admin/users/:id/assign-trainer
const assignTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const prevTrainerId = user.assignedTrainer;

    // Remove from previous trainer's clients
    if (prevTrainerId) {
      await TrainerProfile.findOneAndUpdate(
        { trainer: prevTrainerId },
        { $pull: { assignedClients: user._id } }
      );
    }

    if (trainerId) {
      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== 'trainer') {
        return res.status(400).json({ success: false, message: 'Invalid trainer' });
      }

      user.assignedTrainer = trainerId;
      await TrainerProfile.findOneAndUpdate(
        { trainer: trainerId },
        { $addToSet: { assignedClients: user._id } }
      );
    } else {
      user.assignedTrainer = null;
    }

    await user.save();
    res.json({ success: true, message: 'Trainer assigned', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getUsers, getTrainers, toggleStatus, assignTrainer, deleteUser };
