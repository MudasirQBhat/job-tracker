const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getProfile, updateProfile, uploadResume } = require('../controllers/profileController');

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/resume', auth, upload.single('resume'), uploadResume);

module.exports = router;