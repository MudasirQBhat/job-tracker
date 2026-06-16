const pdf = require('pdf-parse');
const axios = require('axios');
const fs = require('fs/promises');

const extractTextFromPDF = async (source) => {
  try {
    const buffer = /^https?:\/\//.test(source)
      ? Buffer.from((await axios.get(source, { responseType: 'arraybuffer' })).data)
      : await fs.readFile(source);
    const data = await pdf(buffer);
    return data.text.slice(0, 8000);
  } catch (err) {
    console.error('PDF extraction error:', err);
    return '';
  }
};

module.exports = { extractTextFromPDF };
