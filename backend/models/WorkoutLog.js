const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  workoutDate: { type: Date, required: true, default: Date.now },
  duration: { type: Number, required: true, min: 1 }, // minutes
  sets: { type: Number, default: 1, min: 1 },
  reps: { type: Number, default: 1, min: 1 },
  weight: { type: Number, default: 0 }, // kg (0 for bodyweight)
  caloriesBurned: { type: Number, default: 0 },
  completionStatus: {
    type: String,
    enum: ['completed', 'partial', 'skipped'],
    default: 'completed'
  },
  notes: { type: String, maxlength: 500 }
}, { timestamps: true });

workoutLogSchema.index({ user: 1, workoutDate: -1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
