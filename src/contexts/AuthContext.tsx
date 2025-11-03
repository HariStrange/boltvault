// AuthContext.tsx (unchanged except import path if needed)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { AuthContextType, User, RegisterData, LoginResponse, RegisterResponse } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      toast.success('Login successful!');

      switch (userData.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'driver':
          navigate('/dashboard/driver');
          break;
        case 'welder':
          navigate('/dashboard/welder');
          break;
        case 'student':
          navigate('/dashboard/student');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post<RegisterResponse>('/api/auth/register', data);

      toast.success('Registration successful! Please check your email for verification code.');

      localStorage.setItem('pendingVerification', data.email);

      navigate('/verify-email');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      const email = localStorage.getItem('pendingVerification');

      if (!email) {
        throw new Error('No pending verification found');
      }

      await api.post('/api/auth/verify-email', {
        email,
        code,
      });

      toast.success('Email verified successfully! Please login.');

      localStorage.removeItem('pendingVerification');

      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        verifyEmail,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}