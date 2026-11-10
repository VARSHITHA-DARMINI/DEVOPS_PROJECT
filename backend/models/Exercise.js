const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Calisthenics']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  muscleGroup: {
    type: String,
    required: true,
    enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes', 'Full Body', 'Cardio']
  },
  description: { type: String, required: true, maxlength: 1000 },
  instructions: [{ type: String }],
  imageUrl: { type: String, default: '' },
  caloriesPerMinute: { type: Number, default: 5 }
}, { timestamps: true });

exerciseSchema.index({ name: 'text', category: 1, difficulty: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
