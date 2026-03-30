import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('matdaan_token');
    const savedUser = localStorage.getItem('matdaan_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('matdaan_token', token);
    localStorage.setItem('matdaan_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role, adminKey) => {
    const body = { name, email, password };
    if (role === 'admin' && adminKey) {
      body.role = 'admin';
      body.adminKey = adminKey;
    }
    const res = await api.post('/auth/register', body);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('matdaan_token');
    localStorage.removeItem('matdaan_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
