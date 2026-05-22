const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  company:   { type: String, required: true },
  role:      { type: String, required: true },
  category:  { type: String, required: true },
  questions: [{ type: String }],
  logoUrl:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);