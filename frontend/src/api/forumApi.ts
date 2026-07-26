import axiosInstance from "./axiosInstance";
import type {ApiResponse} from "../types/auth";
import type {
  CreateForumCommentRequest,
  CreateForumThreadRequest,
  ForumAttachmentResponse,
  ForumCommentResponse,
  ForumThreadCategory,
  ForumThreadResponse,
  PageResponse,
} from "../types/forum";

export async function getForumThreads(params?: {
  category?: ForumThreadCategory;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<ForumThreadResponse>>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<ForumThreadResponse>>>("/v1/forum/threads", {
    params,
  });
  return response.data;
}

export async function getForumThread(threadId: number): Promise<ApiResponse<ForumThreadResponse>> {
  const response = await axiosInstance.get<ApiResponse<ForumThreadResponse>>(`/v1/forum/threads/${threadId}`);
  return response.data;
}

export async function createForumThread(
  body: CreateForumThreadRequest
): Promise<ApiResponse<ForumThreadResponse>> {
  const response = await axiosInstance.post<ApiResponse<ForumThreadResponse>>("/v1/forum/threads", body);
  return response.data;
}

export async function uploadForumImage(file: File): Promise<ApiResponse<ForumAttachmentResponse>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<ApiResponse<ForumAttachmentResponse>>(
    "/v1/forum/images/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function deleteForumThread(threadId: number): Promise<ApiResponse<void>> {
  const response = await axiosInstance.delete<ApiResponse<void>>(`/v1/forum/threads/${threadId}`);
  return response.data;
}

export async function getForumComments(threadId: number): Promise<ApiResponse<ForumCommentResponse[]>> {
  const response = await axiosInstance.get<ApiResponse<ForumCommentResponse[]>>(
    `/v1/forum/threads/${threadId}/comments`
  );
  return response.data;
}

export async function createForumComment(
  threadId: number,
  body: CreateForumCommentRequest
): Promise<ApiResponse<ForumCommentResponse>> {
  const response = await axiosInstance.post<ApiResponse<ForumCommentResponse>>(
    `/v1/forum/threads/${threadId}/comments`,
    body
  );
  return response.data;
}

export async function deleteForumComment(commentId: number): Promise<ApiResponse<void>> {
  const response = await axiosInstance.delete<ApiResponse<void>>(`/v1/forum/comments/${commentId}`);
  return response.data;
}

export async function toggleForumCommentLike(
  commentId: number
): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
  const response = await axiosInstance.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
    `/v1/forum/comments/${commentId}/like`
  );
  return response.data;
}
