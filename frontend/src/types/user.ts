export type UserRole = 'USER' | 'ADMIN' | 'AUTHOR';

export interface UserType {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  banned: boolean;
  avatarUrl?: string;
  providerId?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
}

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