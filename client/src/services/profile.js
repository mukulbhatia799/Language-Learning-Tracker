import api from '../api/axios';
export const me = () => api.get('/profile/me').then(r => r.data);
export const updateLearner = (p) => api.put('/profile/me/learner', p).then(r => r.data);
export const updateTutor = (p) => api.put('/profile/me/tutor', p).then(r => r.data);
export const changePassword = (p) => api.put('/profile/me/password', p).then(r => r.data);
export const deleteMe = () => api.delete('/profile/me').then(r => r.data);