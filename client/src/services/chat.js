// client/src/services/chat.js
import api from '../api/axios';

export const listPeers    = () => api.get('/chat/peers').then(r => r.data);
export const historyWith  = (peerId, limit = 50) => api.get(`/chat/history/${peerId}`, { params: { limit } }).then(r => r.data);
export const sendMessage  = (to, text) => api.post('/chat/send', { to, text }).then(r => r.data);
