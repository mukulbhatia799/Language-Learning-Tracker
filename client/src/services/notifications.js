import api from '../api/axios';

export const list     = () => api.get('/notifications').then(r => r.data);
export const markRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data);
export const clearAll = () => api.delete('/notifications/clear').then(r => r.data);
