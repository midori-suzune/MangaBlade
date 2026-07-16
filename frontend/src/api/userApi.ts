import axiosClient from './axiosClient';
import type { UserType, SpringPageResponse, UserRole } from '../types/user';

export const adminUserApi = {
  getUsers: (role: UserRole, search?: string, isBanned?: boolean, page = 0, size = 10) => {
    return axiosClient.get<SpringPageResponse<UserType>>(`/v1/admin/users`, {
      params: { role, search, isBanned, page, size }
    });
  },

  updateUser: (id: number, data: Partial<Pick<UserType, 'username' | 'email' | 'role'>>) => {
    return axiosClient.put<UserType>(`/v1/admin/users/${id}`, data);
  },

  deleteUser: (id: number) => {
    return axiosClient.delete<string>(`/v1/admin/users/${id}`);
  },

  toggleBan: (id: number) => {
    return axiosClient.patch<UserType>(`/v1/admin/users/${id}/toggle-ban`);
  }
};
