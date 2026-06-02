import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export const useLogin = (from?: string) => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate(from || '/workspaces', { replace: true });
    },
  });
};

export const useRegister = (from?: string) => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string; displayName?: string }) =>
      authApi.register(data),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate(from || '/workspaces', { replace: true });
    },
  });
};

export const useProfile = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const user = await authApi.getMe();
      setUser(user);
      return user;
    },
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: { displayName?: string; avatar?: string }) => authApi.updateProfile(data),
    onSuccess: (data) => setUser(data),
  });
};
