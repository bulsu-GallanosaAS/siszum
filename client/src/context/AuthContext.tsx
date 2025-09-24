import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  city?: string;
  country?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await apiClient.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
