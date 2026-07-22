import axiosClient from './axiosClient';

export interface AuthorRequestCreateData {
  penName: string;
  phone: string;
  socialLink: string;
}

export interface AuthorRequestResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  penName: string;
  phone: string;
  socialLink: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AuthorRequestReviewData {
  action: 'APPROVE' | 'REJECT';
  rejectReason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface SpringPageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const authorRequestApi = {
  submit: async (data: AuthorRequestCreateData): Promise<ApiResponse<AuthorRequestResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthorRequestResponse>>('/v1/author-requests', data);
    return response.data;
  },
  
  getMyRequest: async (): Promise<ApiResponse<AuthorRequestResponse | null>> => {
    const response = await axiosClient.get<ApiResponse<AuthorRequestResponse | null>>('/v1/author-requests/me');
    return response.data;
  },
  
  getAll: async (status?: string, search?: string, page = 0, size = 10): Promise<ApiResponse<SpringPageResponse<AuthorRequestResponse>>> => {
    const response = await axiosClient.get<ApiResponse<SpringPageResponse<AuthorRequestResponse>>>('/v1/admin/author-requests', {
      params: { status: status || undefined, search: search || undefined, page, size }
    });
    return response.data;
  },
  
  review: async (id: number, data: AuthorRequestReviewData): Promise<ApiResponse<void>> => {
    const response = await axiosClient.put<ApiResponse<void>>(`/v1/admin/author-requests/${id}/review`, data);
    return response.data;
  },
};
