import api from '../api/axios';
export const createVocab = (payload) => api.post('/vocab', payload).then(r => r.data);
export const listVocab = (params) => api.get('/vocab', { params }).then(r => r.data);
export const updateVocab = (id, payload) => api.put(`/vocab/${id}`, payload).then(r => r.data);
export const deleteVocab = (id) => api.delete(`/vocab/${id}`).then(r => r.data);