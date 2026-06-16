const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { encrypt, decrypt } = require('../services/encryptionService');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );
    const user = result.rows[0];

    await pool.query(
      'INSERT INTO profiles (user_id) VALUES ($1)',
      [user.id]
    );

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      hasGeminiKey: !!user.gemini_api_key
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const saveGeminiKey = async (req, res) => {
  const { apiKey } = req.body;
  try {
    const encrypted = encrypt(apiKey);
    await pool.query(
      'UPDATE users SET gemini_api_key = $1 WHERE id = $2',
      [encrypted, req.user.id]
    );
    res.json({ message: 'API key saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save API key' });
  }
};

const deleteGeminiKey = async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET gemini_api_key = NULL WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'API key removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove API key' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, gemini_api_key, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    res.json({
      ...user,
      gemini_api_key: undefined,
      hasGeminiKey: !!user.gemini_api_key
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { signup, login, saveGeminiKey, deleteGeminiKey, getMe };