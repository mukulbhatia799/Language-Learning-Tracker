// client/src/socket.js
import { io } from 'socket.io-client';

let socket = null;

function baseURL() {
  // If VITE_API_BASE=http://localhost:5000/api -> socket base = http://localhost:5000
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
  return api.replace(/\/api\/?$/, '');
}

export function initSocket(token) {
  if (socket?.connected) return socket;
  socket = io(baseURL(), {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket() { return socket; }
