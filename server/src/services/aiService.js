const axios = require('axios');
const pool = require('../config/db');
const { decrypt } = require('./encryptionService');

const GEMINI_MODELS = [
  ...new Set(
    (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-3.5-flash')
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean)
  )
];

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    match_score: { type: 'INTEGER' },
    verdict: { type: 'STRING' },
    strengths: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    skill_gaps: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    advice: { type: 'STRING' },
    keywords_missing: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    interview_tips: { type: 'STRING' }
  },
  required: [
    'match_score',
    'verdict',
    'strengths',
    'skill_gaps',
    'advice',
    'keywords_missing',
    'interview_tips'
  ]
};

const limitText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n[truncated]` : text;
};

const parseAnalysis = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  // Strip fences just in case (older models may still include them)
  const cleaned = rawText.replace(/```json\s*|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required fields are present
    const required = ['match_score', 'verdict', 'strengths', 'skill_gaps', 'advice', 'keywords_missing', 'interview_tips'];
    const missing = required.filter(k => !(k in parsed));
    if (missing.length > 0) {
      throw new Error(`Gemini response missing fields: ${missing.join(', ')}`);
    }

    return parsed;
  } catch (err) {
    console.error('Gemini parse error. Raw text:', cleaned.slice(0, 500));
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }
};

const buildPrompt = (profile, resumeText, job) => {
  return `You are an expert career coach and hiring manager with 20 years of experience.

Analyze the match between this candidate and job application. Be honest and specific.

=== CANDIDATE PROFILE ===
Name: ${profile.name || 'Not provided'}
Title: ${profile.title || 'Not provided'}
Skills: ${(profile.skills || []).join(', ') || 'Not provided'}
Bio: ${profile.bio || 'Not provided'}

Experience:
${(profile.experience || []).map(e => `- ${e.role} at ${e.company} (${e.duration}): ${e.description}`).join('\n') || 'Not provided'}

Education:
${(profile.education || []).map(e => `- ${e.degree} from ${e.institution} (${e.year})`).join('\n') || 'Not provided'}

Resume Text:
${limitText(resumeText, 4000) || 'No resume uploaded'}

=== JOB APPLICATION ===
Company: ${job.company}
Role: ${job.role}
Job Description:
${limitText(job.job_description, 6000)}

=== YOUR TASK ===
Return ONLY raw JSON. The first character must be { and the last character must be }. Do not include markdown, comments, labels, or extra text.

Use this exact JSON shape:

{
  "match_score": <integer 0-100>,
  "verdict": "<one sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "skill_gaps": ["<gap 1>", "<gap 2>"],
  "advice": "<2-3 sentences of specific, actionable advice for this application>",
  "keywords_missing": ["<keyword 1>", "<keyword 2>"],
  "interview_tips": "<1-2 sentences on what to prepare for this specific role>"
}`;
};

const callGemini = async (apiKey, prompt) => {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      // console.log(`Calling Gemini model ${model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            responseSchema: ANALYSIS_SCHEMA
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          timeout: 30000
        }
      );

      const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      // Add this debug log so you can see exactly what Gemini returns
      // console.log('Gemini raw response:', JSON.stringify(rawText).slice(0, 300));

      return { model, text: rawText };
    } catch (err) {
      lastError = err;
      const apiMessage = err.response?.data?.error?.message || err.message;
      console.error(`Gemini model ${model} failed:`, apiMessage);
    }
  }

  throw lastError;
};

const analyzeJobMatch = async (userId, jobId) => {
  try {
    // console.log(`Starting AI analysis for job ${jobId}`);

    const userResult = await pool.query(
      'SELECT name, gemini_api_key FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user?.gemini_api_key)
      throw new Error('No Gemini API key found. Please add your key in Settings.');

    const apiKey = decrypt(user.gemini_api_key);

    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    const profile = { ...profileResult.rows[0], name: user.name };

    const jobResult = await pool.query(
      'SELECT * FROM job_applications WHERE id = $1 AND user_id = $2',
      [jobId, userId]
    );
    if (jobResult.rows.length === 0) throw new Error('Job not found');
    const job = jobResult.rows[0];

    if (!job.job_description)
      throw new Error('No job description found for this application.');

    const prompt = buildPrompt(profile, profile.resume_text, job);

    const { model, text: rawText } = await callGemini(apiKey, prompt);
    if (!rawText) throw new Error('Gemini returned an empty response. Please try again.');

    const analysis = parseAnalysis(rawText);

    await pool.query(
      'UPDATE job_applications SET ai_match_score = $1, ai_analysis = $2, updated_at = NOW() WHERE id = $3',
      [analysis.match_score, JSON.stringify(analysis), jobId]
    );

    // console.log(`AI analysis completed for job ${jobId} with ${model}`);
    return analysis;
  } catch (err) {
    const apiMessage = err.response?.data?.error?.message;
    console.error('AI analysis error:', apiMessage || err.message);

    if (err.response?.status === 404) {
      throw new Error(`None of these Gemini models were found for this API key: ${GEMINI_MODELS.join(', ')}.`);
    }

    if (err.code === 'ECONNABORTED') {
      throw new Error('Gemini analysis timed out. Please try again with a shorter job description.');
    }

    throw new Error(apiMessage || err.message);
  }
};

module.exports = { analyzeJobMatch };
