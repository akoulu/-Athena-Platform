export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}
