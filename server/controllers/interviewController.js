const Interview = require('../models/Interview');

// GET /api/interviews
exports.getInterviews = async (req, res) => {
  try {
    const { category, company } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (company)  filter.company  = company;

    const interviews = await Interview.find(filter);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/interviews/:id
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};