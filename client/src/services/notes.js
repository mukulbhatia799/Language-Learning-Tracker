import api from '../api/axios';
export const list = (params) => api.get('/notes', { params }).then(r => r.data);
export const create = (payload) => api.post('/notes', payload).then(r => r.data);
export const update = (id, payload) => api.put(`/notes/${id}`, payload).then(r => r.data);
export const remove = (id) => api.delete(`/notes/${id}`).then(r => r.data);
