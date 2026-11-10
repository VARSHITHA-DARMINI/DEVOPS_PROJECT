const mongoose = require('mongoose');

const trainerFeedbackSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  category: {
    type: String,
    enum: ['Progress', 'Nutrition', 'Technique', 'Motivation', 'Recovery', 'General'],
    default: 'General'
  },
  feedbackText: { type: String, required: true, maxlength: 2000 },
  recommendations: { type: String, maxlength: 1000 }
}, { timestamps: true });

trainerFeedbackSchema.index({ trainer: 1, client: 1, createdAt: -1 });

module.exports = mongoose.model('TrainerFeedback', trainerFeedbackSchema);
