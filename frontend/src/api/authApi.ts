import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, ForgotPasswordRequest, ResetPasswordRequest, GoogleLoginRequest, ChangePasswordRequest } from '../types/auth';
import axiosInstance from './axiosInstance';

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/v1/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/register', data);
  return response.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/forgot-password', data);
  return response.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/reset-password', data);
  return response.data;
}

export const googleLogin = async (data: GoogleLoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await axiosInstance.post('/v1/auth/google', data);
  return response.data;
};

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/change-password', data);
  return response.data;
}

export async function verifyOtp(data: { email: string; otp: string }): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/verify-otp', data);
  return response.data;
}

export async function resendOtp(data: { email: string }): Promise<ApiResponse<void>> {
  const response = await axiosInstance.post<ApiResponse<void>>('/v1/auth/resend-otp', data);
  return response.data;
}
