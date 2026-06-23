const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobRoutes = require('./routes/jobs');
const aiRoutes = require('./routes/ai');
const { initDB } = require('./config/db');

const app = express();

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'https://job-tracker-three-beta.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

app.get('/debug-env', (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing',
    nodeEnv: process.env.NODE_ENV
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

startServer();
