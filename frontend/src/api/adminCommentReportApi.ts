import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { SpringPageResponse } from '../types/user';

export type AdminCommentReportStatus = 'PENDING' | 'CHECKING' | 'RESOLVED' | 'REJECTED';
export type AdminCommentReportReason = 'SPAM' | 'HARASSMENT' | 'SPOILER' | 'HATE_SPEECH' | 'OTHER';

export interface AdminCommentReportItem {
  id: number;
  commentId: number;
  commentContent: string;
  commentAuthorId?: number;
  commentAuthorUsername: string;
  mangaTitle: string;
  mangaSlug: string;
  chapterNumber?: string;
  reporterUsername: string;
  reason: AdminCommentReportReason;
  description?: string;
  status: AdminCommentReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByUsername?: string;
  rejectReason?: string;
}

export interface AdminCommentReportReviewPayload {
  status: AdminCommentReportStatus;
  deleteComment?: boolean;
  banUser?: boolean;
  rejectReason?: string;
}

export const adminCommentReportApi = {
  getCommentReports: async (params?: {
    status?: string;
    reason?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await axiosInstance.get<ApiResponse<SpringPageResponse<AdminCommentReportItem>>>(
      '/v1/admin/comment-reports',
      { params }
    );
    return { ...res, data: res.data.payload };
  },

  reviewCommentReport: async (id: number, payload: AdminCommentReportReviewPayload) => {
    const res = await axiosInstance.patch<ApiResponse<AdminCommentReportItem>>(
      `/v1/admin/comment-reports/${id}/review`,
      payload
    );
    return { ...res, data: res.data.payload };
  },
};
