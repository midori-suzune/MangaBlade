export type UserRole = 'USER' | 'ADMIN' | 'AUTHOR';

export interface UserType {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  banned: boolean; // Field is_banned từ Spring Boot trả về qua JSON sẽ tự mapping thành banned
  avatarUrl?: string;
  providerId?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
}

// Cấu trúc dữ liệu phân trang trả về từ Spring Boot (Pageable response)
export interface SpringPageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}