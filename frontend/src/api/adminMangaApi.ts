import axiosClient from './axiosClient';
import type { SpringPageResponse } from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
  fieldsErrors?: Record<string, string>;
}

export type AdminMangaStatus = 'ongoing' | 'completed' | 'hidden';
export type AdminMangaOrigin = 'crawl' | 'author';

export interface AdminMangaItem {
  id: number;
  title: string;
  slug: string;
  author: string;
  authorEmail?: string;
  origin: AdminMangaOrigin;
  status: AdminMangaStatus;
  chapters: number;
  reads: number;
  updatedAt: string;
  hiddenReason?: string;
  thumbnail?: string;
}

interface GetAdminMangaParams {
  status?: AdminMangaStatus;
  origin?: AdminMangaOrigin;
  search?: string;
  page?: number;
  size?: number;
}

export const adminMangaApi = {
  getManga: async (params: GetAdminMangaParams = {}) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<AdminMangaItem>>>('/v1/admin/manga', {
      params,
    });
    return { ...response, data: response.data.payload };
  },

  toggleVisibility: async (id: number, reason?: string) => {
    const response = await axiosClient.patch<ApiResponse<AdminMangaItem>>(`/v1/admin/manga/${id}/visibility`, {
      reason,
    });
    return { ...response, data: response.data.payload };
  },
};
