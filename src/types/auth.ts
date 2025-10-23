export type UserRole = 'admin' | 'driver' | 'welder' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<void>;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  phone: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
