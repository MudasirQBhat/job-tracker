const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyze, coverLetter } = require('../controllers/aiController');

router.post('/analyze/:jobId', auth, analyze);
router.post('/cover-letter/:jobId', auth, coverLetter);

module.exports = router;