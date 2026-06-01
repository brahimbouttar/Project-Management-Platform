import api from '../lib/axios';
import type { User } from '../types';

export const userApi = {
  searchByEmail: (email: string) =>
    api.get<User[]>('/users/search', { params: { email } }).then((r) => r.data),
};
