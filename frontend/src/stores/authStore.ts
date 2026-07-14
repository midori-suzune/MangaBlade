import { create } from 'zustand';
import type { UserInfo } from '../types/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  avatarUrl: string | null;
  displayName: string;
  login: (token: string, user: UserInfo, rememberMe: boolean) => void;
  logout: () => void;
  loadFromStorage: () => void;
  openAuthModal: (tab: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  updateAvatar: (url: string | null) => void;
  updateDisplayName: (name: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  avatarUrl: null,
  displayName: '',

  login: (token, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);
    storage.setItem('user', JSON.stringify(user));
    
    const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
    const savedName = localStorage.getItem(`displayName_${user.id}`) || user.username;
    
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      isAuthModalOpen: false,
      avatarUrl: savedAvatar,
      displayName: savedName
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false, avatarUrl: null, displayName: '' });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
        const savedName = localStorage.getItem(`displayName_${user.id}`) || user.username;
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          avatarUrl: savedAvatar,
          displayName: savedName
        });
      } catch {
        set({ token: null, user: null, isAuthenticated: false, avatarUrl: null, displayName: '' });
      }
    }
  },

  openAuthModal: (tab) => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  updateAvatar: (url) => {
    set((state) => {
      if (state.user) {
        if (url) {
          localStorage.setItem(`avatar_${state.user.id}`, url);
        } else {
          localStorage.removeItem(`avatar_${state.user.id}`);
        }
      }
      return { avatarUrl: url };
    });
  },

  updateDisplayName: (name) => {
    set((state) => {
      if (state.user) {
        localStorage.setItem(`displayName_${state.user.id}`, name);
      }
      return { displayName: name };
    });
  },
}));
