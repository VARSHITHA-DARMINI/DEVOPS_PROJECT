const Exercise = require('../models/Exercise');

// @desc    Get all exercises with optional filters
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const { search, category, difficulty, muscleGroup } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (muscleGroup && muscleGroup !== 'All') filter.muscleGroup = muscleGroup;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    res.json({ success: true, count: exercises.length, exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.json({ success: true, exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create exercise (admin only)
// @route   POST /api/exercises
// @access  Admin
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExercises, getExercise, createExercise };
