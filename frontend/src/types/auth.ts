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
  level?: number;
  exp?: number;
  activeTitleId?: number | null;
  activeTitle?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userInfo: UserInfo;
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

export interface GoogleLoginRequest {
  credential: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
