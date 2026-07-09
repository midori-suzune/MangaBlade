export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'AUTHOR' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
  error?: string;
  fieldsErrors?: Record<string, string>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
