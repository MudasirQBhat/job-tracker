import api from './axios';

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const saveGeminiKey = (apiKey) => api.post('/auth/gemini-key', { apiKey });
export const deleteGeminiKey = () => api.delete('/auth/gemini-key');