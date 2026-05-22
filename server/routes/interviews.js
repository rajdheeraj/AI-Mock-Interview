const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  getInterviews, getInterviewById
} = require('../controllers/interviewController');

router.get ('/',    protect, getInterviews);
router.get ('/:id', protect, getInterviewById);

module.exports = router;