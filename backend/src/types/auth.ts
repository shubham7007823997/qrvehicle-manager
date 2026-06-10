export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  uid: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    name: string | null;
    role: string;
  };
}
