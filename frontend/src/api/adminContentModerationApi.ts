import axiosClient from './axiosClient';
import type { SpringPageResponse } from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
}

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminModerationChapter {
  id: number;
  chapterNumber: string;
  title: string | null;
  pageCount: number;
  approvalStatus: ModerationStatus;
  submittedAt: string | null;
  rejectionReason?: string | null;
  previewPages: string[];
  mangaId: number;
  mangaTitle: string;
  mangaSlug: string;
  authorName: string;
  thumbnail: string | null;
}

export interface AdminModerationManga {
  id: number;
  title: string;
  slug: string;
  originName: string | null;
  description: string | null;
  authorName: string;
  authorEmail: string;
  status: string;
  approvalStatus: ModerationStatus;
  categoryNames: string[];
  chapterCount: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason?: string | null;
  thumbnail: string | null;
  chapters: AdminModerationChapter[];
}

interface ModerationListParams {
  status?: ModerationStatus;
  search?: string;
  page?: number;
  size?: number;
}

export const adminContentModerationApi = {
  getManga: async (params: ModerationListParams = {}) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<AdminModerationManga>>>(
      '/v1/admin/content-moderation/manga',
      { params },
    );
    return { ...response, data: response.data.payload };
  },

  reviewManga: async (id: number, status: ModerationStatus, rejectReason?: string) => {
    const response = await axiosClient.patch<ApiResponse<AdminModerationManga>>(
      `/v1/admin/content-moderation/manga/${id}/review`,
      { status, rejectReason },
    );
    return { ...response, data: response.data.payload };
  },

  getChapters: async (params: ModerationListParams = {}) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<AdminModerationChapter>>>(
      '/v1/admin/content-moderation/chapters',
      { params },
    );
    return { ...response, data: response.data.payload };
  },

  reviewChapter: async (id: number, status: ModerationStatus, rejectReason?: string) => {
    const response = await axiosClient.patch<ApiResponse<AdminModerationChapter>>(
      `/v1/admin/content-moderation/chapters/${id}/review`,
      { status, rejectReason },
    );
    return { ...response, data: response.data.payload };
  },
};
