import api from './axios';

export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadResume = (formData) =>
  api.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });