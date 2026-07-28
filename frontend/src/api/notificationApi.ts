import axiosClient from './axiosClient';
import type { SpringPageResponse } from '../types/user';
import type { ApiResponse } from '../types/auth';

export type NotificationTargetType = 'MANGA' | 'CHAPTER' | 'AUTHOR_REQUEST';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (page = 0, size = 10) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<NotificationItem>>>('/v1/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosClient.get<ApiResponse<number>>('/v1/notifications/unread-count');
    return response.data;
  },

  markRead: async (id: number) => {
    const response = await axiosClient.patch<ApiResponse<NotificationItem>>(`/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await axiosClient.patch<ApiResponse<void>>('/v1/notifications/read-all');
    return response.data;
  },
};
