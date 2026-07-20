import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';

export interface ExpHistoryItem {
  time: string;
  type: string;
  amount: number;
}

export interface AchievementItem {
  id: number;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  rewardClaimed: boolean;
  expReward: number;
}

export interface DailyStatusResponse {
  level: number;
  exp: number;
  activeTitle: string | null;
  activeTitleColor: string | null;
  checkInClaimed: boolean;
  chaptersRead: number;
  chaptersRewardClaimed: boolean;
  commentsPosted: number;
  commentsRewardClaimed: boolean;
  luckyWheelSpun: boolean;
  expHistory: ExpHistoryItem[];
  achievements: AchievementItem[];
}

export interface TitleResponse {
  id: number;
  name: string;
  requiredLevel: number;
  colorCode: string;
  equipped: boolean;
}

export const getDailyStatus = async (): Promise<ApiResponse<DailyStatusResponse>> => {
  const response = await axiosInstance.get('/v1/tasks/daily-status');
  return response.data;
};

export const claimCheckIn = async (): Promise<ApiResponse<number>> => {
  const response = await axiosInstance.post('/v1/tasks/claim-checkin');
  return response.data;
};

export const spinWheel = async (): Promise<ApiResponse<number>> => {
  const response = await axiosInstance.post('/v1/tasks/spin-wheel');
  return response.data;
};

export const claimAchievement = async (achievementId: number): Promise<ApiResponse<number>> => {
  const response = await axiosInstance.post(`/v1/tasks/claim-achievement/${achievementId}`);
  return response.data;
};

export const getUnlockedTitles = async (): Promise<ApiResponse<TitleResponse[]>> => {
  const response = await axiosInstance.get('/v1/titles/unlocked');
  return response.data;
};

export const equipTitle = async (titleId: number | null): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.post('/v1/titles/equip', null, {
    params: { titleId }
  });
  return response.data;
};
