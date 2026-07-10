import type {ChapterPageRequest, ChapterPageResponse, MangaDetailResponse, MangaResponse} from '../types/manga';
import type {ApiResponse} from '../types/auth';
import axiosInstance from './axiosInstance';

export async function getManga(): Promise<ApiResponse<MangaResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaResponse[]>>('/api/v1/manga');
  return response.data;
}

export async function getMangaBySlug(slug: string): Promise<ApiResponse<MangaDetailResponse>> {
  const response = await axiosInstance.post<ApiResponse<MangaDetailResponse>>(`/api/v1/manga/${slug}`);
  return response.data;
}

export async function requestChapterPage( body : ChapterPageRequest) : Promise<ApiResponse<ChapterPageResponse[]>>{
   const response = await axiosInstance.post<ApiResponse<ChapterPageResponse[]>>("/api/v1/chapter", body );
   return response.data
}