import api from '../api/axios';

export const listTutors = () => api.get('/doubts/tutors').then(r => r.data);
export const testsOptions = () => api.get('/doubts/tests-options').then(r => r.data);
export const askAI = (payload) => api.post('/doubts/ask-ai', payload).then(r => r.data);
export const askTutor = (payload) => api.post('/doubts/ask-tutor', payload).then(r => r.data);
export const inbox = () => api.get('/doubts/inbox').then(r => r.data);
export const answer = (id, payload) => api.post(`/doubts/${id}/answer`, payload).then(r => r.data);
