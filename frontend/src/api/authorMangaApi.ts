import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { SpringPageResponse } from '../types/user';
import type {
  AuthorMangaResponse,
  AuthorChapterResponse,
  AuthorStatsOverview,
  AuthorMangaStats
} from '../types/author';

// Mock DB State
let mockMangas: AuthorMangaResponse[] = [];
const mockChapters: Record<number, AuthorChapterResponse[]> = {};
const mockChapterPages: Record<number, { id: number; pageNumber: number; imageUrl: string }[]> = {};

export const authorMangaApi = {
  // Manga CRUD
  getMangas: async (status?: string, page = 0, size = 10, search?: string, mangaStatus?: string): Promise<ApiResponse<SpringPageResponse<AuthorMangaResponse>>> => {
    try {
      const response = await axiosClient.get<ApiResponse<SpringPageResponse<AuthorMangaResponse>>>('/v1/author/manga', {
        params: { status, page, size, search, mangaStatus }
      });
      return response.data;
    } catch (err) {
      console.warn("API getMangas failed, using mock fallback data.", err);
      let filtered = [...mockMangas];
      if (status) {
        filtered = filtered.filter(m => m.approvalStatus === status);
      }
      if (search) {
        filtered = filtered.filter(m => 
          m.title.toLowerCase().includes(search.toLowerCase()) || 
          (m.originName && m.originName.toLowerCase().includes(search.toLowerCase()))
        );
      }
      if (mangaStatus) {
        filtered = filtered.filter(m => m.status === mangaStatus);
      }
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = filtered.slice(page * size, (page + 1) * size);
      return {
        success: true,
        message: "Loaded from mock data",
        payload: {
          content,
          totalPages,
          totalElements,
          size,
          number: page,
          first: page === 0,
          last: page === totalPages - 1,
          empty: content.length === 0
        }
      };
    }
  },

  getMangaDetail: async (mangaId: number | string): Promise<ApiResponse<AuthorMangaResponse>> => {
    try {
      const response = await axiosClient.get<ApiResponse<AuthorMangaResponse>>(`/v1/author/manga/${mangaId}`);
      return response.data;
    } catch (err) {
      console.warn("API getMangaDetail failed, using mock fallback data.", err);
      const manga = mockMangas.find(m => m.id === Number(mangaId) || m.slug === String(mangaId));
      if (!manga) {
        return { success: false, message: "Manga not found", payload: null as never };
      }
      return {
        success: true,
        message: "Loaded from mock data",
        payload: manga
      };
    }
  },

  createManga: async (data: {
    title: string;
    originName?: string;
    description?: string;
    status: string;
    categoryIds: number[];
  }): Promise<ApiResponse<AuthorMangaResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<AuthorMangaResponse>>('/v1/author/manga', data);
      return response.data;
    } catch (err) {
      console.warn("API createManga failed, writing to mock DB.", err);
      const newId = mockMangas.length > 0 ? Math.max(...mockMangas.map(m => m.id)) + 1 : 1;
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newManga: AuthorMangaResponse = {
        id: newId,
        title: data.title,
        slug: slug,
        originName: data.originName || null,
        description: data.description || "",
        status: data.status,
        approvalStatus: "DRAFT",
        rejectionReason: null,
        submittedAt: null,
        chapterCount: 0,
        viewCount: 0,
        followCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: data.categoryIds.map(id => ({ id, name: id === 1 ? "Action" : id === 2 ? "Adventure" : id === 4 ? "Comedy" : "Thể loại", slug: "category" })),
        thumbUrl: "",
        localCoverUrl: ""
      };
      mockMangas.push(newManga);
      return {
        success: true,
        message: "Created mock manga draft successfully",
        payload: newManga
      };
    }
  },

  updateManga: async (mangaId: number, data: {
    title: string;
    originName?: string;
    description?: string;
    status: string;
    categoryIds: number[];
  }): Promise<ApiResponse<AuthorMangaResponse>> => {
    try {
      const response = await axiosClient.put<ApiResponse<AuthorMangaResponse>>(`/v1/author/manga/${mangaId}`, data);
      return response.data;
    } catch (err) {
      console.warn("API updateManga failed, writing to mock DB.", err);
      const idx = mockMangas.findIndex(m => m.id === mangaId);
      if (idx === -1) return { success: false, message: "Manga not found", payload: null as never };

      mockMangas[idx] = {
        ...mockMangas[idx],
        title: data.title,
        originName: data.originName || null,
        description: data.description || "",
        status: data.status,
        updatedAt: new Date().toISOString(),
        categories: data.categoryIds.map(id => ({ id, name: id === 1 ? "Action" : id === 2 ? "Adventure" : id === 4 ? "Comedy" : "Thể loại", slug: "category" }))
      };
      return {
        success: true,
        message: "Updated mock manga successfully",
        payload: mockMangas[idx]
      };
    }
  },

  submitManga: async (mangaId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.post<ApiResponse<void>>(`/v1/author/manga/${mangaId}/submit`);
      return response.data;
    } catch (err) {
      console.warn("API submitManga failed, writing to mock DB.", err);
      const idx = mockMangas.findIndex(m => m.id === mangaId);
      if (idx !== -1) {
        mockMangas[idx].approvalStatus = "PENDING";
      }
      return { success: true, message: "Submitted mock manga successfully", payload: null as never };
    }
  },

  cancelMangaSubmission: async (mangaId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.post<ApiResponse<void>>(`/v1/author/manga/${mangaId}/cancel-submit`);
      return response.data;
    } catch (err) {
      console.warn("API cancelMangaSubmission failed, writing to mock DB.", err);
      const idx = mockMangas.findIndex(m => m.id === mangaId);
      if (idx !== -1) {
        mockMangas[idx].approvalStatus = "DRAFT";
      }
      if (mockChapters[mangaId]) {
        mockChapters[mangaId].forEach(c => {
          if (c.approvalStatus === "PENDING") {
            c.approvalStatus = "DRAFT";
          }
        });
      }
      return { success: true, message: "Cancelled mock manga submission successfully", payload: null as never };
    }
  },

  deleteManga: async (mangaId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.delete<ApiResponse<void>>(`/v1/author/manga/${mangaId}`);
      return response.data;
    } catch (err) {
      console.warn("API deleteManga failed, deleting from mock DB.", err);
      mockMangas = mockMangas.filter(m => m.id !== mangaId);
      return { success: true, message: "Deleted mock manga successfully", payload: null as never };
    }
  },

  uploadCover: async (identifier: string | number, file: File): Promise<ApiResponse<{ coverUrl: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post<ApiResponse<{ coverUrl: string }>>(
        `/v1/author/manga/${identifier}/cover`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (err) {
      console.warn("API uploadCover failed, uploading cover in mock DB.", err);
      const coverUrl = URL.createObjectURL(file);
      const idx = mockMangas.findIndex(m => m.id === Number(identifier) || m.slug === String(identifier));
      if (idx !== -1) {
        mockMangas[idx].localCoverUrl = coverUrl;
        mockMangas[idx].thumbUrl = coverUrl;
      }
      return {
        success: true,
        message: "Uploaded mock cover successfully",
        payload: { coverUrl }
      };
    }
  },

  // Chapter CRUD
  getChapters: async (mangaId: number | string, page = 0, size = 20): Promise<ApiResponse<SpringPageResponse<AuthorChapterResponse>>> => {
    try {
      const response = await axiosClient.get<ApiResponse<SpringPageResponse<AuthorChapterResponse>>>(
        `/v1/author/manga/${mangaId}/chapters`,
        { params: { page, size } }
      );
      return response.data;
    } catch (err) {
      console.warn("API getChapters failed, retrieving mock fallback.", err);
      const list = mockChapters[Number(mangaId)] || [];
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = list.slice(page * size, (page + 1) * size);
      return {
        success: true,
        message: "Loaded from mock data",
        payload: {
          content,
          totalPages,
          totalElements,
          size,
          number: page,
          first: page === 0,
          last: page === totalPages - 1,
          empty: content.length === 0
        }
      };
    }
  },

  getChapterDetail: async (chapterId: number): Promise<ApiResponse<AuthorChapterResponse>> => {
    try {
      const response = await axiosClient.get<ApiResponse<AuthorChapterResponse>>(`/v1/author/chapters/${chapterId}`);
      return response.data;
    } catch (err) {
      console.warn("API getChapterDetail failed, retrieving mock fallback.", err);
      for (const mId in mockChapters) {
        const ch = mockChapters[mId].find(c => c.id === chapterId);
        if (ch) {
          return { success: true, message: "Loaded from mock data", payload: ch };
        }
      }
      return { success: false, message: "Chapter not found", payload: null as never };
    }
  },

  createChapter: async (mangaId: number | string, data: {
    chapterNumber: string;
    title?: string;
    chapterSort?: number;
  }): Promise<ApiResponse<AuthorChapterResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<AuthorChapterResponse>>(
        `/v1/author/manga/${mangaId}/chapters`,
        data
      );
      return response.data;
    } catch (err) {
      console.warn("API createChapter failed, writing to mock DB.", err);
      const numId = Number(mangaId) || 0;
      if (!mockChapters[numId]) mockChapters[numId] = [];
      const newId = Math.floor(Math.random() * 100000);
      const newChapter: AuthorChapterResponse = {
        id: newId,
        mangaId: numId,
        chapterNumber: data.chapterNumber,
        title: data.title || "",
        chapterSort: data.chapterSort || (mockChapters[numId].length + 1),
        pageCount: 0,
        approvalStatus: "DRAFT",
        rejectionReason: null,
        submittedAt: null,
        createdAt: new Date().toISOString()
      };
      mockChapters[numId].push(newChapter);

      // Increment manga chapter count
      const mangaIdx = mockMangas.findIndex(m => m.id === numId || m.slug === String(mangaId));
      if (mangaIdx !== -1) {
        mockMangas[mangaIdx].chapterCount += 1;
      }

      return {
        success: true,
        message: "Added mock chapter draft successfully",
        payload: newChapter
      };
    }
  },

  updateChapter: async (chapterId: number, data: {
    chapterNumber: string;
    title?: string;
    chapterSort?: number;
  }): Promise<ApiResponse<AuthorChapterResponse>> => {
    try {
      const response = await axiosClient.put<ApiResponse<AuthorChapterResponse>>(
        `/v1/author/chapters/${chapterId}`,
        data
      );
      return response.data;
    } catch (err) {
      console.warn("API updateChapter failed, writing to mock DB.", err);
      for (const mId in mockChapters) {
        const idx = mockChapters[mId].findIndex(c => c.id === chapterId);
        if (idx !== -1) {
          mockChapters[mId][idx] = {
            ...mockChapters[mId][idx],
            chapterNumber: data.chapterNumber,
            title: data.title || "",
            chapterSort: data.chapterSort || mockChapters[mId][idx].chapterSort
          };
          return {
            success: true,
            message: "Updated mock chapter successfully",
            payload: mockChapters[mId][idx]
          };
        }
      }
      return { success: false, message: "Chapter not found", payload: null as never };
    }
  },

  saveChapterPages: async (chapterId: number, imageUrls: string[]): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.post<ApiResponse<void>>(
        `/v1/author/chapters/${chapterId}/pages`,
        imageUrls
      );
      return response.data;
    } catch (err) {
      console.warn("API saveChapterPages failed, writing to mock DB.", err);
      mockChapterPages[chapterId] = imageUrls.map((url, index) => ({
        id: Math.floor(Math.random() * 100000),
        pageNumber: index + 1,
        imageUrl: url
      }));
      return { success: true, message: "Saved mock chapter pages", payload: null as never };
    }
  },

  getChapterPages: async (chapterId: number): Promise<ApiResponse<{ id: number; pageNumber: number; imageUrl: string }[]>> => {
    try {
      const response = await axiosClient.get<ApiResponse<{ id: number; pageNumber: number; imageUrl: string }[]>>(
        `/v1/author/chapters/${chapterId}/pages`
      );
      return response.data;
    } catch (err) {
      console.warn("API getChapterPages failed, retrieving mock fallback.", err);
      return {
        success: true,
        message: "Loaded from mock data",
        payload: mockChapterPages[chapterId] || []
      };
    }
  },

  uploadChapterPages: async (chapterId: number, files: File[]): Promise<ApiResponse<void>> => {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      const response = await axiosClient.post<ApiResponse<void>>(
        `/v1/author/chapters/${chapterId}/pages/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (err) {
      console.warn("API uploadChapterPages failed, writing to mock DB.", err);
      if (!mockChapterPages[chapterId]) mockChapterPages[chapterId] = [];
      
      const newPages = files.map((file, idx) => ({
        id: Math.floor(Math.random() * 1000000),
        pageNumber: mockChapterPages[chapterId].length + idx + 1,
        imageUrl: URL.createObjectURL(file)
      }));
      mockChapterPages[chapterId].push(...newPages);

      // Update pageCount in chapter
      for (const mId in mockChapters) {
        const chIdx = mockChapters[mId].findIndex(c => c.id === chapterId);
        if (chIdx !== -1) {
          mockChapters[mId][chIdx].pageCount = mockChapterPages[chapterId].length;
        }
      }

      return { success: true, message: "Uploaded mock chapter pages successfully", payload: null as never };
    }
  },

  submitChapter: async (chapterId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.post<ApiResponse<void>>(`/v1/author/chapters/${chapterId}/submit`);
      return response.data;
    } catch (err) {
      console.warn("API submitChapter failed, writing to mock DB.", err);
      for (const mId in mockChapters) {
        const idx = mockChapters[mId].findIndex(c => c.id === chapterId);
        if (idx !== -1) {
          mockChapters[mId][idx].approvalStatus = "PENDING";
        }
      }
      return { success: true, message: "Submitted mock chapter successfully", payload: null as never };
    }
  },

  cancelChapterSubmission: async (chapterId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.post<ApiResponse<void>>(`/v1/author/chapters/${chapterId}/cancel-submit`);
      return response.data;
    } catch (err) {
      console.warn("API cancelChapterSubmission failed, writing to mock DB.", err);
      for (const mId in mockChapters) {
        const idx = mockChapters[mId].findIndex(c => c.id === chapterId);
        if (idx !== -1) {
          mockChapters[mId][idx].approvalStatus = "DRAFT";
        }
      }
      return { success: true, message: "Cancelled mock chapter submission successfully", payload: null as never };
    }
  },

  deleteChapter: async (chapterId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.delete<ApiResponse<void>>(`/v1/author/chapters/${chapterId}`);
      return response.data;
    } catch (err) {
      console.warn("API deleteChapter failed, deleting in mock DB.", err);
      for (const mId in mockChapters) {
        const idx = mockChapters[mId].findIndex(c => c.id === chapterId);
        if (idx !== -1) {
          mockChapters[mId] = mockChapters[mId].filter(c => c.id !== chapterId);
          // Decrement manga chapter count
          const mangaIdx = mockMangas.findIndex(m => m.id === Number(mId));
          if (mangaIdx !== -1) {
            mockMangas[mangaIdx].chapterCount = Math.max(0, mockMangas[mangaIdx].chapterCount - 1);
          }
          break;
        }
      }
      return { success: true, message: "Deleted mock chapter successfully", payload: null as never };
    }
  },

  // Statistics
  getStatsOverview: async (): Promise<ApiResponse<AuthorStatsOverview>> => {
    try {
      const response = await axiosClient.get<ApiResponse<AuthorStatsOverview>>('/v1/author/stats/overview');
      return response.data;
    } catch (err) {
      console.warn("API getStatsOverview failed, retrieving mock fallback.", err);
      const totalManga = mockMangas.length;
      const totalViews = mockMangas.reduce((acc, m) => acc + m.viewCount, 0);
      const totalFollows = mockMangas.reduce((acc, m) => acc + m.followCount, 0);
      // Hardcode total comments for mock
      const totalComments = 1542;
      return {
        success: true,
        message: "Loaded from mock data",
        payload: { totalManga, totalViews, totalFollows, totalComments }
      };
    }
  },

  getMangaStats: async (page = 0, size = 10): Promise<ApiResponse<SpringPageResponse<AuthorMangaStats>>> => {
    try {
      const response = await axiosClient.get<ApiResponse<SpringPageResponse<AuthorMangaStats>>>(
        '/v1/author/stats/mangas',
        { params: { page, size } }
      );
      return response.data;
    } catch (err) {
      console.warn("API getMangaStats failed, retrieving mock fallback.", err);
      const list: AuthorMangaStats[] = mockMangas.map(m => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        thumbUrl: m.localCoverUrl || m.thumbUrl,
        approvalStatus: m.approvalStatus,
        viewCount: m.viewCount,
        followCount: m.followCount,
        commentCount: Math.round(m.viewCount * 0.002) // estimate comments
      }));
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size);
      const content = list.slice(page * size, (page + 1) * size);
      return {
        success: true,
        message: "Loaded from mock data",
        payload: {
          content,
          totalPages,
          totalElements,
          size,
          number: page,
          first: page === 0,
          last: page === totalPages - 1,
          empty: content.length === 0
        }
      };
    }
  }
};
