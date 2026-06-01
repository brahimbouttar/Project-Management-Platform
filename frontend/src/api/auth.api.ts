import api from '../lib/axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { email: string; username: string; password: string; displayName?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getMe: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: { displayName?: string; avatar?: string }) =>
    api.put<User>('/auth/profile', data).then((r) => r.data),
};
