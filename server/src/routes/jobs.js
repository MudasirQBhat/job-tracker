const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getJobs, getJob, createJob, updateJob, deleteJob, getDashboardStats } = require('../controllers/jobController');

router.get('/dashboard', auth, getDashboardStats);
router.get('/', auth, getJobs);
router.get('/:id', auth, getJob);
router.post('/', auth, createJob);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;