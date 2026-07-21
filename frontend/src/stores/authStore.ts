import { create } from 'zustand';
import type { UserInfo } from '../types/auth';
import { userProfileApi } from '../api/userApi';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  avatarUrl: string | null;
  displayName: string;
  level: number;
  exp: number;
  activeTitle: string | null;
  activeTitleColor: string | null;
  login: (token: string, user: UserInfo, rememberMe: boolean) => void;
  logout: () => void;
  loadFromStorage: () => void;
  openAuthModal: (tab: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  updateAvatar: (file: File) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateLevelAndExp: (level: number, exp: number) => void;
  updateActiveTitle: (title: string | null, color: string | null) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  avatarUrl: null,
  displayName: '',
  level: 0,
  exp: 0,
  activeTitle: null,
  activeTitleColor: null,

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
      avatarUrl: user.avatarUrl ?? savedAvatar,
      displayName: user.displayName ?? savedName,
      level: user.level ?? 0,
      exp: user.exp ?? 0,
      activeTitle: user.activeTitle ?? null,
      activeTitleColor: null
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false, 
      avatarUrl: null, 
      displayName: '',
      level: 0,
      exp: 0,
      activeTitle: null,
      activeTitleColor: null
    });
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
          avatarUrl: user.avatarUrl ?? savedAvatar,
          displayName: user.displayName ?? savedName,
          level: user.level ?? 0,
          exp: user.exp ?? 0,
          activeTitle: user.activeTitle ?? null,
          activeTitleColor: null
        });
      } catch {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false, 
          avatarUrl: null, 
          displayName: '',
          level: 0,
          exp: 0,
          activeTitle: null,
          activeTitleColor: null
        });
      }
    }
  },

  openAuthModal: (tab) => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  updateAvatar: async (file) => {
    const tempUrl = URL.createObjectURL(file);
    const previousUrl = useAuthStore.getState().avatarUrl;

    // Cập nhật giao diện lập tức (Optimistic UI)
    set({ avatarUrl: tempUrl });

    try {
      const res = await userProfileApi.updateAvatar(file);
      if (res.success && res.payload) {
        set({ avatarUrl: res.payload.avatarUrl || null });
        if (res.payload.avatarUrl) {
          localStorage.setItem(`avatar_${res.payload.id}`, res.payload.avatarUrl);
        }
      }
    } catch (err) {
      // Revert lại ảnh cũ nếu có lỗi
      set({ avatarUrl: previousUrl });
      console.error("Failed to update avatar", err);
      throw err;
    } finally {
      // Giải phóng bộ nhớ của blob URL sau khi trình duyệt đã tải xong ảnh mới
      setTimeout(() => {
        URL.revokeObjectURL(tempUrl);
      }, 1000);
    }
  },

  updateDisplayName: async (name) => {
    try {
      const res = await userProfileApi.updateProfile({ displayName: name });
      if (res.success && res.payload) {
        set({ displayName: res.payload.displayName || name });
        localStorage.setItem(`displayName_${res.payload.id}`, res.payload.displayName || name);
      }
    } catch (err) {
      console.error("Failed to update display name", err);
      throw err;
    }
  },

  updateLevelAndExp: (level, exp) => {
    set({ level, exp });
  },

  updateActiveTitle: (title, color) => {
    set({ activeTitle: title, activeTitleColor: color });
  },

  fetchProfile: async () => {
    try {
      const res = await userProfileApi.getProfile();
      if (res.success && res.payload) {
        const u = res.payload;
        set({
          level: u.level ?? 0,
          exp: u.exp ?? 0,
          avatarUrl: u.avatarUrl || null,
          displayName: u.displayName || u.username,
          activeTitle: u.activeTitle || null,
          activeTitleColor: u.activeTitleColor || null
        });
        if (u.avatarUrl) {
          localStorage.setItem(`avatar_${u.id}`, u.avatarUrl);
        }
        if (u.displayName) {
          localStorage.setItem(`displayName_${u.id}`, u.displayName);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  },
}));
