const { analyzeJobMatch } = require('../services/aiService');

const analyze = async (req, res) => {
  const { jobId } = req.params;
  try {
    const analysis = await analyzeJobMatch(req.user.id, jobId);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyze };