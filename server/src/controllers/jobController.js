const pool = require('../config/db');

const getJobs = async (req, res) => {
  const { status, sort = 'created_at', order = 'DESC' } = req.query;
  try {
    let query = 'SELECT * FROM job_applications WHERE user_id = $1';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    const allowedSorts = ['created_at', 'applied_date', 'ai_match_score', 'company'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

const getJob = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM job_applications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

const createJob = async (req, res) => {
  const { company, role, job_description, status, applied_date, job_url, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO job_applications
        (user_id, company, role, job_description, status, applied_date, job_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.user.id, company, role, job_description, status || 'Applied', applied_date, job_url, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

const updateJob = async (req, res) => {
  const { company, role, job_description, status, applied_date, job_url, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE job_applications SET
        company=$1, role=$2, job_description=$3, status=$4,
        applied_date=$5, job_url=$6, notes=$7, updated_at=NOW()
       WHERE id=$8 AND user_id=$9
       RETURNING *`,
      [company, role, job_description, status, applied_date, job_url, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Applied') as applied,
        COUNT(*) FILTER (WHERE status = 'Interviewing') as interviewing,
        COUNT(*) FILTER (WHERE status = 'Offer') as offer,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
        ROUND(AVG(ai_match_score)) as avg_match_score
       FROM job_applications WHERE user_id = $1`,
      [req.user.id]
    );

    const recent = await pool.query(
      `SELECT id, company, role, status, ai_match_score, applied_date
       FROM job_applications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );

    res.json({ stats: stats.rows[0], recent: recent.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getDashboardStats };