import api from './axios';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{
      success: boolean;
      data: { token: string; user: { uid: string; email: string; role: string } };
    }>('/auth/login', { email, password }),
};
