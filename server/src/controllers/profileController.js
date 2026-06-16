const pool = require('../config/db');
const { extractTextFromPDF } = require('../services/pdfService');

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  const { title, bio, skills, experience, education, github_url, linkedin_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE profiles SET
        title = $1, bio = $2, skills = $3,
        experience = $4, education = $5,
        github_url = $6, linkedin_url = $7,
        updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [title, bio, skills, JSON.stringify(experience), JSON.stringify(education), github_url, linkedin_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const resumeUrl = /^https?:\/\//.test(req.file.path)
      ? req.file.path
      : `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;
    const resumeText = await extractTextFromPDF(req.file.path);

    await pool.query(
      'UPDATE profiles SET resume_url = $1, resume_text = $2, updated_at = NOW() WHERE user_id = $3',
      [resumeUrl, resumeText, req.user.id]
    );

    res.json({ resume_url: resumeUrl, message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

module.exports = { getProfile, updateProfile, uploadResume };
