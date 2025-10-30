export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  providerId?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
}
