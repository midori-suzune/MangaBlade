import axiosClient from './axiosClient';
import type { SpringPageResponse } from '../types/user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
  fieldsErrors?: Record<string, string>;
}

export interface AdminForumDraftImageItem {
  id: number;
  userId: number;
  username: string;
  objectKey: string;
  url: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface AdminForumDraftImageList {
  images: SpringPageResponse<AdminForumDraftImageItem>;
  totalCount: number;
  totalSizeBytes: number;
}

export interface AdminForumDraftImageDeleteResult {
  deletedCount: number;
  deletedSizeBytes: number;
}

interface GetDraftImagesParams {
  olderThanHours?: number;
  search?: string;
  page?: number;
  size?: number;
}

export const adminForumDraftImageApi = {
  getDraftImages: async (params: GetDraftImagesParams = {}) => {
    const response = await axiosClient.get<ApiResponse<AdminForumDraftImageList>>('/v1/admin/forum-draft-images', {
      params,
    });
    return { ...response, data: response.data.payload };
  },

  deleteDraftImage: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<AdminForumDraftImageDeleteResult>>(
      `/v1/admin/forum-draft-images/${id}`
    );
    return { ...response, data: response.data.payload };
  },

  deleteDraftImages: async (ids: number[]) => {
    const response = await axiosClient.post<ApiResponse<AdminForumDraftImageDeleteResult>>(
      '/v1/admin/forum-draft-images/delete',
      { ids }
    );
    return { ...response, data: response.data.payload };
  },
};
