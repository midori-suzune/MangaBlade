import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth';
import axiosInstance from './axiosInstance';

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/api/v1/auth/register', data);
  return response.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/api/v1/auth/forgot-password', data);
  return response.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/api/v1/auth/reset-password', data);
  return response.data;
}
