import type {
  ChapterPageRequest,
  ChapterPageResponse,
  CreateCommentRequest,
  MangaCommentResponse,
  MangaDetailResponse,
  MangaInteractionResponse,
  MangaRankingResponse,
  MangaResponse,
  MangaSearchResponse,
  RecentCommentResponse,
  ReadingHistoryResponse
} from '../types/manga';
import type {ApiResponse} from '../types/auth';
import axiosInstance from './axiosInstance';

export async function getManga(): Promise<ApiResponse<MangaResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaResponse[]>>('/api/v1/manga');
  return response.data;
}

export async function getMangaRanking(sort: 'likes' | 'follows'): Promise<ApiResponse<MangaRankingResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaRankingResponse[]>>('/api/v1/manga/ranking', {
    params: { sort },
  });
  return response.data;
}

export async function searchManga(query: string, limit = 5): Promise<ApiResponse<MangaSearchResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaSearchResponse[]>>('/api/v1/manga/search', {
    params: { query, limit },
  });
  return response.data;
}

export async function getRecentUserComments(): Promise<ApiResponse<RecentCommentResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<RecentCommentResponse[]>>('/api/v1/manga/comments/recent-users');
  return response.data;
}

export async function getReadingHistory(): Promise<ApiResponse<ReadingHistoryResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<ReadingHistoryResponse[]>>('/api/v1/reading-history');
  return response.data;
}

export async function getLatestReadingHistory(slug: string): Promise<ApiResponse<ReadingHistoryResponse | null>> {
  const response = await axiosInstance.get<ApiResponse<ReadingHistoryResponse | null>>(`/api/v1/reading-history/${slug}`);
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

export async function toggleMangaFollow(slug: string): Promise<ApiResponse<MangaInteractionResponse>> {
  const response = await axiosInstance.post<ApiResponse<MangaInteractionResponse>>(`/api/v1/manga/${slug}/follow`);
  return response.data;
}

export async function toggleMangaLike(slug: string): Promise<ApiResponse<MangaInteractionResponse>> {
  const response = await axiosInstance.post<ApiResponse<MangaInteractionResponse>>(`/api/v1/manga/${slug}/like`);
  return response.data;
}

export async function getMangaComments(slug: string): Promise<ApiResponse<MangaCommentResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaCommentResponse[]>>(`/api/v1/manga/${slug}/comments`);
  return response.data;
}

export async function createMangaComment(
  slug: string,
  body: CreateCommentRequest
): Promise<ApiResponse<MangaCommentResponse>> {
  const response = await axiosInstance.post<ApiResponse<MangaCommentResponse>>(`/api/v1/manga/${slug}/comments`, body);
  return response.data;
}
