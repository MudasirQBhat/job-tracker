import api from './axios';

export const analyzeJob = (jobId) => api.post(`/ai/analyze/${jobId}`);