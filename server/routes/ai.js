const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  generateQuestions,
  evaluateAnswers
} = require('../controllers/aiController');

router.post('/generate-questions', protect, generateQuestions);
router.post('/evaluate',           protect, evaluateAnswers);

module.exports = router;