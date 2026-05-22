const Attempt = require('../models/Attempt');

// GET /api/attempts  — get logged-in user's history
exports.getAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/attempts  — save a completed interview
exports.saveAttempt = async (req, res) => {
  try {
    const { company, role, category, answers, totalScore, feedback } = req.body;
    const attempt = await Attempt.create({
      userId: req.user.id,
      company, role, category, answers, totalScore, feedback
    });
    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/attempts/:id  — single attempt detail
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.id,
      userId: req.user.id     // security: only owner can view
    });
    if (!attempt) return res.status(404).json({ message: 'Not found' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};