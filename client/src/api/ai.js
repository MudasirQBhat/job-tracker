import api from './axios';

export const analyzeJob = (jobId) => api.post(`/ai/analyze/${jobId}`);
export const generateCoverLetter = (jobId) => api.post(`/ai/cover-letter/${jobId}`);