const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'trainer', 'user'],
    default: 'user'
  },
  age: { type: Number, min: 10, max: 120 },
  gender: { type: String, enum: ['male', 'female', 'other', ''] },
  height: { type: Number, min: 50, max: 300 }, // cm
  weight: { type: Number, min: 10, max: 500 }, // kg
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', ''],
    default: ''
  },
  fitnessPreferences: [{ type: String }],
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
