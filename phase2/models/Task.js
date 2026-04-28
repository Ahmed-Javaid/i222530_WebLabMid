const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      minlength: [5, 'Title must be at least 5 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    },
    minVolunteers: {
      type: Number,
      default: 1,
      min: 1
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
