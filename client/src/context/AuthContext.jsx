import { createContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data);
          setHasGeminiKey(res.data.hasGeminiKey);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData, geminiKey) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setHasGeminiKey(geminiKey);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHasGeminiKey(false);
  };

  return (
    <AuthContext.Provider value={{ user, hasGeminiKey, setHasGeminiKey, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};