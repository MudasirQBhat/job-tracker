const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyze } = require('../controllers/aiController');

router.post('/analyze/:jobId', auth, analyze);

module.exports = router;