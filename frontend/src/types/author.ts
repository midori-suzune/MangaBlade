import type { CategoryResponse } from './manga';

export interface AuthorMangaResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  originName: string | null;
  status: string;
  thumbUrl: string | null;
  localCoverUrl: string | null;
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories: CategoryResponse[];
  chapterCount: number;
  viewCount: number;
  followCount: number;
}

export interface AuthorChapterResponse {
  id: number;
  mangaId: number;
  chapterNumber: string;
  title: string | null;
  chapterSort: number;
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
  pageCount: number;
}

export interface AuthorStatsOverview {
  totalManga: number;
  totalViews: number;
  totalFollows: number;
  totalComments: number;
}

export interface AuthorMangaStats {
  id: number;
  title: string;
  slug: string;
  thumbUrl: string | null;
  viewCount: number;
  followCount: number;
  commentCount: number;
  approvalStatus: string;
}
