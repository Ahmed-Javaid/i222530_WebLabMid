/**
 * Seed Script — Populates the database with sample tasks and volunteers
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const Task = require('./models/Task');
const Volunteer = require('./models/Volunteer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster-relief';

const volunteers = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah@relief.org',
    skills: ['Medical', 'First Aid'],
    availability: 'available'
  },
  {
    name: 'James Rodriguez',
    email: 'james@relief.org',
    skills: ['Logistics', 'Engineering'],
    availability: 'available'
  },
  {
    name: 'Aisha Khan',
    email: 'aisha@relief.org',
    skills: ['Search and Rescue', 'First Aid'],
    availability: 'available'
  },
  {
    name: 'David Chen',
    email: 'david@relief.org',
    skills: ['Engineering', 'Logistics'],
    availability: 'available'
  },
  {
    name: 'Maria Santos',
    email: 'maria@relief.org',
    skills: ['Medical', 'Logistics'],
    availability: 'available'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Task.deleteMany({});
    await Volunteer.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert volunteers first so we can reference their IDs
    const insertedVolunteers = await Volunteer.insertMany(volunteers);
    console.log(`👥 Inserted ${insertedVolunteers.length} volunteers`);

    // Create tasks with some assigned volunteers
    const tasks = [
      {
        title: 'Medical Supply Distribution',
        description: 'Distribute medical supplies to the eastern district shelters. Priority items include first aid kits, medications, and PPE.',
        priority: 'critical',
        status: 'active',
        minVolunteers: 4,
        requiredSkills: ['Medical', 'Logistics'],
        assignedVolunteers: [insertedVolunteers[0]._id]
      },
      {
        title: 'Search & Rescue Sector B',
        description: 'Conduct search and rescue sweep of collapsed structures in Sector B. Heavy equipment required.',
        priority: 'critical',
        status: 'pending',
        minVolunteers: 6,
        requiredSkills: ['Search and Rescue', 'Engineering'],
        assignedVolunteers: []
      },
      {
        title: 'Shelter Setup at Central Park',
        description: 'Set up temporary shelters and triage center at Central Park for displaced residents.',
        priority: 'high',
        status: 'active',
        minVolunteers: 3,
        requiredSkills: ['First Aid', 'Logistics'],
        assignedVolunteers: [insertedVolunteers[1]._id]
      },
      {
        title: 'Water Purification Station',
        description: 'Install and operate portable water purification station at the community center.',
        priority: 'medium',
        status: 'pending',
        minVolunteers: 2,
        requiredSkills: ['Engineering'],
        assignedVolunteers: []
      },
      {
        title: 'Food Bank Coordination',
        description: 'Organize and distribute food supplies at three designated points across the affected zone.',
        priority: 'high',
        status: 'pending',
        minVolunteers: 5,
        requiredSkills: ['Logistics'],
        assignedVolunteers: []
      }
    ];

    const insertedTasks = await Task.insertMany(tasks);
    console.log(`📋 Inserted ${insertedTasks.length} tasks`);

    console.log('\n✅ Seed completed successfully!');
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
