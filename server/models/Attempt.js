const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:  { type: String, required: true },
  role:     { type: String, required: true },
  category: { type: String, default: 'General' },
  answers: [{
    question:    String,
    answer:      String,
    score:       { type: Number, default: 0 },
    feedback:    { type: String, default: '' },
    strength:    { type: String, default: '' },
    improvement: { type: String, default: '' },
    idealAnswer: { type: String, default: '' },
  }],
  totalScore:       { type: Number,   default: 0  },
  feedback:         { type: String,   default: '' },
  grade:            { type: String,   default: '' },
  strongerSections: [{ type: String }],
  weakerSections:   [{ type: String }],
  improvementAreas: [{
    topic:      String,
    priority:   String,
    suggestion: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);