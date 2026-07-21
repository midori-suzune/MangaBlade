import axiosClient from './axiosClient';
import type { UserType, SpringPageResponse, UserRole } from '../types/user';
import type { UserInfo } from '../types/auth';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
  fieldsErrors?: Record<string, string>;
}

interface GetUsersParams {
  role?: UserRole;
  search?: string;
  isBanned?: boolean;
  page?: number;
  size?: number;
}

export const adminUserApi = {
  getUsers: async (params: GetUsersParams = {}) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<UserType>>>(`/v1/admin/users`, {
      params
    });
    return { ...response, data: response.data.payload };
  },

  updateUser: async (id: number, data: Partial<Pick<UserType, 'username' | 'email' | 'role'>>) => {
    const response = await axiosClient.put<ApiResponse<UserType>>(`/v1/admin/users/${id}`, data);
    return { ...response, data: response.data.payload };
  },

  deleteUser: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/v1/admin/users/${id}`);
    return { ...response, data: response.data.payload };
  },

  toggleBan: async (id: number) => {
    const response = await axiosClient.patch<ApiResponse<UserType>>(`/v1/admin/users/${id}/toggle-ban`);
    return { ...response, data: response.data.payload };
  }
};

export const userProfileApi = {
  getProfile: async () => {
    const response = await axiosClient.get<ApiResponse<UserInfo>>('/v1/users/profile');
    return response.data;
  },
  updateProfile: async (data: { displayName: string }) => {
    const response = await axiosClient.put<ApiResponse<UserInfo>>('/v1/users/profile', data);
    return response.data;
  },
  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ApiResponse<UserInfo>>('/v1/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

