export interface CreateUserDTO {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface BaseUserDTO extends UserDTO {
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
