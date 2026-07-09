import { create } from 'zustand';
import type { UserInfo } from '../types/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  login: (token: string, user: UserInfo, rememberMe: boolean) => void;
  logout: () => void;
  loadFromStorage: () => void;
  openAuthModal: (tab: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalTab: 'login',

  login: (token, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);
    storage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isAuthModalOpen: false });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        set({ token, user, isAuthenticated: true });
      } catch {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },

  openAuthModal: (tab) => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
