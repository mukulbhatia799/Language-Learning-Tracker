import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/auth';
import { initSocket, getSocket } from '../socket';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  function connectSocketIfReady(nextUser = user) {
    const token = localStorage.getItem('token');
    if (nextUser && token) initSocket(token);
  }

  function login(u, t) {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
    setUser(u);
    connectSocketIfReady(u);
  }

  function logout() {
    try { getSocket()?.disconnect(); } catch {}
    localStorage.removeItem('user'); localStorage.removeItem('token');
    setUser(null); navigate('/login');
  }

  async function handleLogin(email, password) {
    const { user: u, token } = await authApi.login({ email, password });
    login(u, token); navigate('/');
  }

  async function handleRegister(payload) {
    const { user: u, token } = await authApi.register(payload);
    login(u, token); navigate('/profile');
  }

  useEffect(() => { if (user) connectSocketIfReady(user); }, [user]);

  return (
    <AuthContext.Provider value={{ user, logout, handleLogin, handleRegister, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
