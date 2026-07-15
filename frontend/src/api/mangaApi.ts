<<<<<<< HEAD
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

export async function getFollowedManga(): Promise<ApiResponse<MangaResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaResponse[]>>('/api/v1/manga/followed');
  return response.data;
}

export async function getMangaRanking(sort: 'likes' | 'views'): Promise<ApiResponse<MangaRankingResponse[]>> {
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

export async function filterManga(params: {
  category?: string;
  author?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<MangaSearchResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<MangaSearchResponse[]>>('/api/v1/manga/filter', {
    params,
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
=======
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// === BỔ SUNG HÀM GETMANGA ĐỂ SỬA LỖI BUILD CỦA TRANG HOME ===
export const getManga = async () => {
  // Đường dẫn endpoint này tùy thuộc vào API lấy danh sách truyện hiện tại của Backend bạn thiết lập
  const response = await axiosClient.get('/manga'); 
  return response.data;
};

// Vẫn giữ lại export mặc định cho axiosClient để trang Login dùng chung
export default axiosClient;
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf
