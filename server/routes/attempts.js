const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  getAttempts, saveAttempt, getAttemptById
} = require('../controllers/attemptController');

router.use(protect);   // all attempt routes require login

router.get ('/',    getAttempts);
router.post('/',    saveAttempt);
router.get ('/:id', getAttemptById);

module.exports = router;