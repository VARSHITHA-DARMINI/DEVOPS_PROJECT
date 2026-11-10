const mongoose = require('mongoose');

const trainerProfileSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  experience: { type: Number, default: 0 }, // years
  bio: { type: String, maxlength: 1000 },
  certifications: [{ type: String }],
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('TrainerProfile', trainerProfileSchema);
