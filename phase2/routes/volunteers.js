const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Volunteer = require('../models/Volunteer');

// GET /api/volunteers — Fetch all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/volunteers — Register a new volunteer (with express-validator)
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Full name is required'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email address'),
    body('skills')
      .optional()
      .isArray().withMessage('Skills must be an array')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, skills } = req.body;
      const volunteer = await Volunteer.create({ name, email, skills });
      res.status(201).json(volunteer);
    } catch (err) {
      // Handle duplicate email
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
