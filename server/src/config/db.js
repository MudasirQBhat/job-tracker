const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL || '';
const placeholderValues = new Set([
  '',
  'your_neon_postgres_url_here',
  'your_postgres_url_here',
  'postgres_connection_string_here'
]);

const validateDatabaseUrl = () => {
  if (placeholderValues.has(databaseUrl)) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in server/.env to a real Postgres URL, for example: postgresql://user:password@host:5432/database?sslmode=require'
    );
  }

  try {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error('invalid protocol');
    }
  } catch (err) {
    throw new Error(
      'DATABASE_URL must be a valid Postgres connection string beginning with postgres:// or postgresql://'
    );
  }
};

const sslConfig = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
  ? false
  : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslConfig
});

const initDB = async () => {
  validateDatabaseUrl();

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        gemini_api_key TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        bio TEXT,
        skills TEXT[],
        experience JSONB DEFAULT '[]',
        education JSONB DEFAULT '[]',
        github_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        resume_url TEXT,
        resume_text TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        job_description TEXT,
        status VARCHAR(50) DEFAULT 'Applied',
        applied_date DATE DEFAULT CURRENT_DATE,
        job_url VARCHAR(500),
        notes TEXT,
        ai_match_score INTEGER,
        ai_analysis JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('DB init error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = pool;
module.exports.initDB = initDB;
