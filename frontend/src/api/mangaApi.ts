import type { MangaResponse } from '../types/manga';
import type { ApiResponse } from '../types/auth';
import axiosInstance from './axiosInstance';

export async function getManga(): Promise<ApiResponse<MangaResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaResponse[]>>('/api/v1/manga');
  return response.data;
}
