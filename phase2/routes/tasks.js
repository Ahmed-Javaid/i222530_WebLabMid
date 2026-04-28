const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');

// GET /api/tasks — Fetch all tasks (populated with volunteer refs)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedVolunteers').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks — Create a new task (with express-validator)
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('priority')
      .notEmpty().withMessage('Priority is required')
      .isIn(['critical', 'high', 'medium']).withMessage('Priority must be critical, high, or medium'),
    body('minVolunteers')
      .optional()
      .isInt({ min: 1 }).withMessage('minVolunteers must be at least 1')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, priority, minVolunteers, requiredSkills } = req.body;
      const task = await Task.create({
        title,
        description,
        priority,
        minVolunteers,
        requiredSkills
      });
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PATCH /api/tasks/:id/status — Update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('assignedVolunteers');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:id/assign — Assign a volunteer to a task
router.post('/:id/assign', async (req, res) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) return res.status(400).json({ error: 'volunteerId is required' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.assignedVolunteers.includes(volunteerId)) {
      return res.status(400).json({ error: 'Volunteer already assigned' });
    }

    task.assignedVolunteers.push(volunteerId);
    await task.save();
    await task.populate('assignedVolunteers');
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
