import api from '../api/axios';
export const createLesson = (payload) => api.post('/lessons', payload).then(r => r.data);
export const listLessons = (params) => api.get('/lessons', { params }).then(r => r.data);
export const updateLesson = (id, payload) => api.put(`/lessons/${id}`, payload).then(r => r.data);
export const deleteLesson = (id) => api.delete(`/lessons/${id}`).then(r => r.data);