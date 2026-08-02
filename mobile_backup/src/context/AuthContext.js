import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe, apiLogin, apiRegister, apiGuestLogin, apiLogout, getStoredToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        const u = await apiGetMe();
        setUser(u);
      }
    } catch (e) {
      console.warn('[AuthContext] Token restore failed:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const u = await apiLogin({ email, password });
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const u = await apiRegister({ name, email, password });
    setUser(u);
    return u;
  };

  const guestLogin = async (name) => {
    const u = await apiGuestLogin({ name });
    setUser(u);
    return u;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
