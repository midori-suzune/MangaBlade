import { create } from 'zustand';
import type { UserInfo } from '../types/auth';
import { userProfileApi } from '../api/userApi';
import { logout as logoutApi } from '../api/authApi';

interface AuthState {
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
  login: (user: UserInfo, rememberMe: boolean) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  openAuthModal: (tab: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  updateAvatar: (file: File) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateLevelAndExp: (level: number, exp: number) => void;
  updateActiveTitle: (title: string | null, color: string | null) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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

  login: (user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    storage.setItem('user', JSON.stringify(user));
    
    const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
    const savedName = localStorage.getItem(`displayName_${user.id}`) || user.username;
    
    set({ 
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

  logout: async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Failed to clear auth cookie", err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      set({
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
  },

  loadFromStorage: async () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
        const savedName = localStorage.getItem(`displayName_${user.id}`) || user.username;
        set({ 
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

    try {
      const res = await userProfileApi.getProfile({ skipAuthExpiredHandler: true });
      if (res.success && res.payload) {
        const u = res.payload;
        localStorage.setItem('user', JSON.stringify(u));
        set({
          user: u,
          isAuthenticated: true,
          avatarUrl: u.avatarUrl || localStorage.getItem(`avatar_${u.id}`),
          displayName: u.displayName || localStorage.getItem(`displayName_${u.id}`) || u.username,
          level: u.level ?? 0,
          exp: u.exp ?? 0,
          activeTitle: u.activeTitle ?? null,
          activeTitleColor: u.activeTitleColor ?? null
        });
      }
    } catch {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      set({
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
        const newAvatar = res.payload.avatarUrl || null;
        const currentUser = useAuthStore.getState().user;
        const updatedUser = currentUser ? { ...currentUser, avatarUrl: newAvatar } : null;
        set({ 
          avatarUrl: newAvatar,
          user: updatedUser
        });
        if (newAvatar && res.payload.id) {
          localStorage.setItem(`avatar_${res.payload.id}`, newAvatar);
        }
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
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
        localStorage.setItem('user', JSON.stringify(u));
        set({
          user: u,
          isAuthenticated: true,
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
