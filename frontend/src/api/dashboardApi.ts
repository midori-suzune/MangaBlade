import axiosClient from './axiosClient';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface DashboardReadingStats {
  totalReads: number;
  previousTotalReads: number;
  readDelta: number;
  dailyReads: Array<{
    date: string;
    label: string;
    reads: number;
  }>;
}

export interface DashboardStatistic {
  totalUsers: number;
  newUsersToday: number;
  totalManga: number;
  newMangaToday: number;
  ongoingManga: number;
  completedManga: number;
  hiddenManga: number;
  totalComments: number;
  newCommentsToday: number;
  totalAuthorRequests: number;
  pendingAuthorRequests: number;
}

export const dashboardApi = {
  getStatistics: async (): Promise<DashboardStatistic> => {
    const response = await axiosClient.get<ApiResponse<DashboardStatistic>>('/v1/admin/dashboard/statistics');
    return response.data.payload;
  },

  getReadingStats: async (days = 7): Promise<DashboardReadingStats> => {
    const response = await axiosClient.get<ApiResponse<DashboardReadingStats>>('/v1/admin/dashboard/reading-stats', {
      params: { days },
    });
    return response.data.payload;
  },
};
