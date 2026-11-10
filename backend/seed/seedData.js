require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const Exercise = require('../models/Exercise');
const FitnessGoal = require('../models/FitnessGoal');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');
const TrainerFeedback = require('../models/TrainerFeedback');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fittrack';

const exercises = [
  { name: 'Barbell Bench Press', category: 'Strength', difficulty: 'intermediate', muscleGroup: 'Chest', description: 'Classic compound chest exercise using a barbell on a flat bench.', instructions: ['Lie on flat bench', 'Grip bar slightly wider than shoulder-width', 'Lower bar to chest', 'Press back up explosively'], caloriesPerMinute: 7 },
  { name: 'Push-Up', category: 'Calisthenics', difficulty: 'beginner', muscleGroup: 'Chest', description: 'Fundamental bodyweight exercise targeting chest, shoulders and triceps.', instructions: ['Start in plank position', 'Lower chest to floor', 'Push back up keeping core tight'], caloriesPerMinute: 5 },
  { name: 'Pull-Up', category: 'Calisthenics', difficulty: 'intermediate', muscleGroup: 'Back', description: 'Upper body pulling exercise that builds lat strength and grip.', instructions: ['Hang from bar with palms facing away', 'Pull body up until chin clears bar', 'Lower slowly with control'], caloriesPerMinute: 6 },
  { name: 'Deadlift', category: 'Strength', difficulty: 'advanced', muscleGroup: 'Back', description: 'Foundational compound lift for total body strength development.', instructions: ['Stand with feet hip-width', 'Hinge at hips and grip bar', 'Drive through heels to stand', 'Lower under control'], caloriesPerMinute: 8 },
  { name: 'Squat', category: 'Strength', difficulty: 'intermediate', muscleGroup: 'Legs', description: 'King of lower body exercises targeting quads, hamstrings and glutes.', instructions: ['Feet shoulder-width apart', 'Brace core and chest up', 'Lower until thighs parallel', 'Drive through heels to rise'], caloriesPerMinute: 7 },
  { name: 'Running', category: 'Cardio', difficulty: 'beginner', muscleGroup: 'Cardio', description: 'High-impact cardiovascular exercise for endurance and calorie burn.', instructions: ['Warm up with brisk walk', 'Maintain steady pace', 'Land mid-foot', 'Keep arms relaxed'], caloriesPerMinute: 10 },
  { name: 'Cycling', category: 'Cardio', difficulty: 'beginner', muscleGroup: 'Legs', description: 'Low-impact cardio exercise excellent for leg strength and endurance.', instructions: ['Adjust seat height', 'Maintain steady cadence', 'Keep back straight', 'Breathe rhythmically'], caloriesPerMinute: 8 },
  { name: 'Plank', category: 'Calisthenics', difficulty: 'beginner', muscleGroup: 'Core', description: 'Isometric core exercise that builds stability and endurance.', instructions: ['Forearms on floor', 'Body in straight line', 'Engage core throughout', 'Hold for time'], caloriesPerMinute: 4 },
  { name: 'Dumbbell Shoulder Press', category: 'Strength', difficulty: 'intermediate', muscleGroup: 'Shoulders', description: 'Overhead pressing movement for shoulder strength and stability.', instructions: ['Sit or stand with dumbbells at shoulder height', 'Press overhead until arms extended', 'Lower with control'], caloriesPerMinute: 6 },
  { name: 'Bicep Curl', category: 'Strength', difficulty: 'beginner', muscleGroup: 'Arms', description: 'Isolation exercise for bicep development and arm strength.', instructions: ['Stand with dumbbells at sides', 'Curl weights toward shoulders', 'Squeeze at top', 'Lower slowly'], caloriesPerMinute: 4 },
  { name: 'Tricep Dips', category: 'Calisthenics', difficulty: 'intermediate', muscleGroup: 'Arms', description: 'Compound exercise targeting triceps, shoulders and chest.', instructions: ['Grip parallel bars', 'Lower body by bending elbows', 'Push back to start'], caloriesPerMinute: 5 },
  { name: 'Lunges', category: 'Strength', difficulty: 'beginner', muscleGroup: 'Legs', description: 'Unilateral leg exercise for balance, strength and coordination.', instructions: ['Step forward with one leg', 'Lower back knee toward floor', 'Push back to start', 'Alternate legs'], caloriesPerMinute: 6 },
  { name: 'Burpees', category: 'HIIT', difficulty: 'advanced', muscleGroup: 'Full Body', description: 'High-intensity full body exercise combining squat, push-up and jump.', instructions: ['Stand feet together', 'Drop to squat and kick feet back', 'Perform push-up', 'Jump feet forward and leap up'], caloriesPerMinute: 12 },
  { name: 'Mountain Climbers', category: 'HIIT', difficulty: 'intermediate', muscleGroup: 'Core', description: 'Dynamic core exercise with cardiovascular benefits.', instructions: ['Start in push-up position', 'Drive alternating knees to chest', 'Maintain plank position', 'Keep hips level'], caloriesPerMinute: 10 },
  { name: 'Downward Dog', category: 'Yoga', difficulty: 'beginner', muscleGroup: 'Full Body', description: 'Foundational yoga pose that stretches and strengthens the entire body.', instructions: ['Start on hands and knees', 'Lift hips toward ceiling', 'Straighten arms and legs', 'Press heels toward floor'], caloriesPerMinute: 3 },
  { name: 'Kettlebell Swing', category: 'HIIT', difficulty: 'intermediate', muscleGroup: 'Full Body', description: 'Explosive hip hinge movement for power and conditioning.', instructions: ['Stand feet wider than hip-width', 'Hinge at hips and swing kettlebell back', 'Drive hips forward explosively', 'Allow bell to float to shoulder height'], caloriesPerMinute: 11 },
  { name: 'Romanian Deadlift', category: 'Strength', difficulty: 'intermediate', muscleGroup: 'Glutes', description: 'Hip hinge movement targeting hamstrings and glutes.', instructions: ['Stand holding barbell', 'Hinge at hips keeping back straight', 'Lower until feel hamstring stretch', 'Drive hips forward to stand'], caloriesPerMinute: 7 },
  { name: 'Leg Press', category: 'Strength', difficulty: 'beginner', muscleGroup: 'Legs', description: 'Machine-based lower body exercise for quad and glute development.', instructions: ['Sit in leg press machine', 'Place feet shoulder-width on platform', 'Lower weight with control', 'Press back up without locking knees'], caloriesPerMinute: 6 },
  { name: 'Jump Rope', category: 'Cardio', difficulty: 'beginner', muscleGroup: 'Cardio', description: 'Cardiovascular exercise improving coordination, agility and endurance.', instructions: ['Hold handles at hip height', 'Swing rope over head', 'Jump with both feet', 'Stay on balls of feet'], caloriesPerMinute: 11 },
  { name: 'Pilates Roll-Up', category: 'Pilates', difficulty: 'beginner', muscleGroup: 'Core', description: 'Controlled spinal flexion exercise for core strength and flexibility.', instructions: ['Lie flat on back', 'Reach arms overhead', 'Roll up vertebra by vertebra', 'Reach for toes', 'Roll back slowly'], caloriesPerMinute: 3 }
];

const getDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      TrainerProfile.deleteMany({}),
      Exercise.deleteMany({}),
      FitnessGoal.deleteMany({}),
      WorkoutPlan.deleteMany({}),
      WorkoutLog.deleteMany({}),
      TrainerFeedback.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create exercises
    const createdExercises = await Exercise.insertMany(exercises);
    console.log(`✅ Created ${createdExercises.length} exercises`);

    // Create users (passwords hashed by pre-save hook)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@fittrack.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });

    const trainerUser = await User.create({
      name: 'Alex Rivera',
      email: 'trainer@fittrack.com',
      password: 'Trainer@123',
      role: 'trainer',
      age: 32,
      gender: 'male',
      height: 180,
      weight: 78,
      fitnessLevel: 'advanced',
      fitnessPreferences: ['Strength', 'HIIT'],
      isActive: true
    });

    const memberUser = await User.create({
      name: 'Jordan Smith',
      email: 'user@fittrack.com',
      password: 'User@123',
      role: 'user',
      age: 28,
      gender: 'male',
      height: 175,
      weight: 82,
      fitnessLevel: 'intermediate',
      fitnessPreferences: ['Strength', 'Cardio'],
      assignedTrainer: trainerUser._id,
      isActive: true
    });

    const memberUser2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@fittrack.com',
      password: 'Sarah@123',
      role: 'user',
      age: 25,
      gender: 'female',
      height: 163,
      weight: 58,
      fitnessLevel: 'beginner',
      fitnessPreferences: ['Yoga', 'Cardio'],
      assignedTrainer: trainerUser._id,
      isActive: true
    });

    const memberUser3 = await User.create({
      name: 'Mike Johnson',
      email: 'mike@fittrack.com',
      password: 'Mike@123',
      role: 'user',
      age: 35,
      gender: 'male',
      height: 182,
      weight: 90,
      fitnessLevel: 'advanced',
      fitnessPreferences: ['Strength', 'CrossFit'],
      isActive: true
    });

    console.log('✅ Created users');

    // Create trainer profile
    const trainerProfile = await TrainerProfile.create({
      trainer: trainerUser._id,
      specialization: 'Strength & Conditioning',
      experience: 7,
      bio: 'Certified personal trainer with 7 years of experience in strength training, HIIT and sports conditioning.',
      certifications: ['NASM-CPT', 'CSCS', 'CrossFit Level 2'],
      assignedClients: [memberUser._id, memberUser2._id],
      rating: 4.8,
      totalRatings: 24
    });

    console.log('✅ Created trainer profile');

    // Create fitness goals for memberUser
    const goalsData = [
      { user: memberUser._id, goalName: 'Lose 10kg', goalType: 'Weight Loss', startValue: 82, currentValue: 79, targetValue: 72, unit: 'kg', targetDate: new Date(Date.now() + 90 * 24 * 3600000), status: 'active', notes: 'Cut calories and increase cardio' },
      { user: memberUser._id, goalName: 'Bench Press 100kg', goalType: 'Strength', startValue: 70, currentValue: 85, targetValue: 100, unit: 'kg', targetDate: new Date(Date.now() + 60 * 24 * 3600000), status: 'active', notes: 'Progressive overload 2.5kg per week' },
      { user: memberUser._id, goalName: 'Run 5km', goalType: 'Endurance', startValue: 2, currentValue: 5, targetValue: 5, unit: 'km', targetDate: new Date(Date.now() - 10 * 24 * 3600000), status: 'completed', notes: 'Completed!' },
      { user: memberUser._id, goalName: 'Improve Flexibility', goalType: 'Flexibility', startValue: 1, currentValue: 5, targetValue: 10, unit: 'level', targetDate: new Date(Date.now() + 120 * 24 * 3600000), status: 'active', notes: 'Daily stretching routine' }
    ];

    await FitnessGoal.insertMany(goalsData);
    console.log('✅ Created fitness goals');

    // Find exercises by name
    const bench = createdExercises.find(e => e.name === 'Barbell Bench Press');
    const squat = createdExercises.find(e => e.name === 'Squat');
    const deadlift = createdExercises.find(e => e.name === 'Deadlift');
    const pullup = createdExercises.find(e => e.name === 'Pull-Up');
    const run = createdExercises.find(e => e.name === 'Running');
    const plank = createdExercises.find(e => e.name === 'Plank');
    const pushup = createdExercises.find(e => e.name === 'Push-Up');
    const lunge = createdExercises.find(e => e.name === 'Lunges');
    const burpee = createdExercises.find(e => e.name === 'Burpees');
    const mountain = createdExercises.find(e => e.name === 'Mountain Climbers');

    // Create workout plan
    await WorkoutPlan.create({
      user: memberUser._id,
      planName: 'Push Pull Legs – 6 Day Split',
      description: 'Classic PPL program for hypertrophy and strength.',
      difficulty: 'intermediate',
      schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      durationWeeks: 8,
      exercises: [
        { exercise: bench._id, sets: 4, reps: 8 },
        { exercise: pushup._id, sets: 3, reps: 15 },
        { exercise: pullup._id, sets: 4, reps: 10 },
        { exercise: deadlift._id, sets: 4, reps: 5 },
        { exercise: squat._id, sets: 4, reps: 8 },
        { exercise: lunge._id, sets: 3, reps: 12 }
      ]
    });

    console.log('✅ Created workout plan');

    // Create 45 days of workout logs
    const logsData = [];
    for (let i = 44; i >= 0; i--) {
      const date = getDaysAgo(i);
      // Skip some days for realism
      if (i % 7 === 0 || (i % 7 === 6 && i > 10)) continue;

      const dayExercises = [bench, squat, deadlift, pullup, run, plank, pushup, burpee, mountain][i % 9];
      logsData.push({
        user: memberUser._id,
        exercise: dayExercises._id,
        workoutDate: date,
        duration: 30 + Math.floor(Math.random() * 45),
        sets: 3 + Math.floor(Math.random() * 2),
        reps: 8 + Math.floor(Math.random() * 7),
        weight: [bench, squat, deadlift].includes(dayExercises) ? 60 + Math.floor(Math.random() * 30) : 0,
        caloriesBurned: (30 + Math.floor(Math.random() * 45)) * dayExercises.caloriesPerMinute,
        completionStatus: Math.random() > 0.1 ? 'completed' : 'partial',
        notes: i % 5 === 0 ? 'Great session today!' : ''
      });
    }

    await WorkoutLog.insertMany(logsData);
    console.log(`✅ Created ${logsData.length} workout logs`);

    // Create trainer feedback
    await TrainerFeedback.create({
      trainer: trainerUser._id,
      client: memberUser._id,
      rating: 5,
      category: 'Progress',
      feedbackText: 'Jordan has shown exceptional progress this month. His squat form has improved significantly and he has consistently hit his weekly targets.',
      recommendations: 'Increase squat weight by 5kg next week. Add 15 minutes of HIIT twice per week to accelerate fat loss.'
    });

    await TrainerFeedback.create({
      trainer: trainerUser._id,
      client: memberUser._id,
      rating: 4,
      category: 'Technique',
      feedbackText: 'Good work on the deadlift. Keep focusing on keeping the bar close to your body throughout the lift.',
      recommendations: 'Practice Romanian deadlifts with lighter weight to reinforce the hip hinge pattern.'
    });

    console.log('✅ Created trainer feedback');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('           DEMO LOGIN CREDENTIALS          ');
    console.log('═══════════════════════════════════════════');
    console.log('  Admin   → admin@fittrack.com / Admin@123');
    console.log('  Trainer → trainer@fittrack.com / Trainer@123');
    console.log('  User    → user@fittrack.com / User@123');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
