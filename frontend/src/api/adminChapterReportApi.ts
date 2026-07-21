import axiosClient from './axiosClient';
import type { SpringPageResponse } from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
  fieldsErrors?: Record<string, string>;
}

export type AdminChapterReportStatus = 'PENDING' | 'CHECKING' | 'RESOLVED' | 'REJECTED';
export type AdminChapterReportType = 'IMAGE_BROKEN' | 'MISSING_PAGE' | 'WRONG_ORDER' | 'DUPLICATE_CHAPTER' | 'WRONG_CONTENT';

export interface AdminChapterReportItem {
  id: number;
  mangaTitle: string;
  mangaSlug: string;
  chapterNumber: string;
  chapterTitle: string;
  type: AdminChapterReportType;
  reporter: string;
  description: string;
  status: AdminChapterReportStatus;
  createdAt: string;
  rejectReason?: string;
}

interface GetAdminChapterReportsParams {
  status?: AdminChapterReportStatus;
  type?: AdminChapterReportType;
  search?: string;
  page?: number;
  size?: number;
}

export const adminChapterReportApi = {
  getReports: async (params: GetAdminChapterReportsParams = {}) => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<AdminChapterReportItem>>>('/v1/admin/chapter-reports', {
      params,
    });
    return { ...response, data: response.data.payload };
  },

  reviewReport: async (id: number, status: AdminChapterReportStatus, rejectReason?: string) => {
    const response = await axiosClient.patch<ApiResponse<AdminChapterReportItem>>(`/v1/admin/chapter-reports/${id}/review`, {
      status,
      rejectReason,
    });
    return { ...response, data: response.data.payload };
  },
};
