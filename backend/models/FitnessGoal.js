const mongoose = require('mongoose');

const fitnessGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalName: { type: String, required: true, trim: true },
  goalType: {
    type: String,
    required: true,
    enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Strength', 'Custom']
  },
  startValue: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  targetValue: { type: Number, required: true },
  unit: { type: String, required: true, default: 'kg' },
  targetDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  notes: { type: String, maxlength: 500 }
}, { timestamps: true });

// Virtual: progress percentage
fitnessGoalSchema.virtual('progressPercentage').get(function() {
  const total = Math.abs(this.targetValue - this.startValue);
  if (total === 0) return 100;
  const achieved = Math.abs(this.currentValue - this.startValue);
  return Math.min(100, Math.round((achieved / total) * 100));
});

fitnessGoalSchema.set('toJSON', { virtuals: true });
fitnessGoalSchema.set('toObject', { virtuals: true });

fitnessGoalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('FitnessGoal', fitnessGoalSchema);
