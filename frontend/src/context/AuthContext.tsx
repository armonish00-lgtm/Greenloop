import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  unreadCount: number;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  quickLogin: (role: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  postLoginRedirect: string | null;
  setPostLoginRedirect: (page: string | null) => void;
  openAuthModal: (mode?: 'login' | 'register', redirectTo?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('greenloop_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('greenloop_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setUnreadCount(data.unreadNotifications || 0);
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password: pass });
      localStorage.setItem('greenloop_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      localStorage.setItem('greenloop_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    setIsLoading(true);
    try {
      const data = await api.quickLogin(role);
      localStorage.setItem('greenloop_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('greenloop_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login', redirectTo?: string) => {
    setAuthModalMode(mode);
    if (redirectTo) {
      setPostLoginRedirect(redirectTo);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        unreadCount,
        login,
        register,
        quickLogin,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        postLoginRedirect,
        setPostLoginRedirect,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
