const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  restSeconds: { type: Number, default: 60 },
  notes: { type: String }
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 500 },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  schedule: [{ type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] }],
  durationWeeks: { type: Number, default: 4 },
  exercises: [workoutExerciseSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

workoutPlanSchema.index({ user: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
