const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Volunteer name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    skills: {
      type: [String],
      default: []
    },
    availability: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
