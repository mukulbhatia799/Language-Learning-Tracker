import api from '../api/axios';
export const upsert = (payload) => api.post('/studylog', payload).then(r => r.data);
export const summary = () => api.get('/studylog/summary').then(r => r.data);
