const pool = require('../config/db');
const { extractTextFromPDF } = require('../services/pdfService');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');
const { Readable } = require('stream');

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

const uploadToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'job-tracker/resumes',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        public_id: `resume_${userId}_${Date.now()}`
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeUrl;

    if (hasCloudinaryConfig) {
      const result = await uploadToCloudinary(req.file.buffer, req.user.id);
      resumeUrl = result.secure_url;
    } else {
      resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.originalname}`;
    }

    const resumeText = await extractTextFromPDF(req.file.buffer);

    await pool.query(
      'UPDATE profiles SET resume_url = $1, resume_text = $2, updated_at = NOW() WHERE user_id = $3',
      [resumeUrl, resumeText, req.user.id]
    );

    res.json({ resume_url: resumeUrl, message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error('uploadResume error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile, uploadResume };