import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  function login(u, t) {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('user'); localStorage.removeItem('token');
    setUser(null); navigate('/login');
  }

  async function handleLogin(email, password) {
    const { user: u, token } = await authApi.login({ email, password });
    login(u, token);
    navigate('/');
  }

  async function handleRegister(payload) {
    const { user: u, token } = await authApi.register(payload);
    login(u, token);
    // Send to onboarding appropriate to role
    navigate('/profile');
  }

  return (
    <AuthContext.Provider value={{ user, logout, handleLogin, handleRegister, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
