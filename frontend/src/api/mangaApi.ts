import type {MangaDetailResponse, MangaResponse} from '../types/manga';
import type { ApiResponse } from '../types/auth';
import axiosInstance from './axiosInstance';

export async function getManga(): Promise<ApiResponse<MangaResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaResponse[]>>('/api/v1/manga');
  return response.data;
}

export async function getMangaBySlug(slug: string): Promise<ApiResponse<MangaDetailResponse>> {
  const response = await axiosInstance.post<ApiResponse<MangaDetailResponse>>(`/api/v1/manga/${slug}`);
  return response.data;
}