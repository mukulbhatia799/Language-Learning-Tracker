import api from '../api/axios';

// learner
export const listLive = (params) => api.get('/tests', { params }).then(r => r.data);
export const getOne = (id) => api.get(`/tests/${id}`).then(r => r.data);
export const submit = (id, answers) => api.post(`/tests/${id}/submit`, { answers }).then(r => r.data);

// tutor
export const generate = (payload) => api.post('/tests/generate', payload).then(r => r.data);
export const create = (payload) => api.post('/tests', payload).then(r => r.data);
export const setLive = (id, isLive) => api.patch(`/tests/${id}/live`, { isLive }).then(r => r.data);
export const mine = () => api.get('/tests/mine').then(r => r.data);
export const submissionsFor = (id) => api.get(`/tests/${id}/submissions`).then(r => r.data);
export const remove = (id) => api.delete(`/tests/${id}`).then(r => r.data);
export const completedMine = () => api.get('/tests/completed/mine').then(r => r.data);