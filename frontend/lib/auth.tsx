'use client';

import axios from 'axios';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

export interface AuthUser {
  username: string;
  displayName: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: {
    username: string;
    displayName: string;
  } | null;
}

interface LoginInput {
  username: string;
  password: string;
}

interface ApiErrorPayload {
  detail?: string;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  loginError: string | null;
}

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.detail ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to complete the request.';
}

function normalizeUser(user: SessionResponse['user']): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    username: user.username,
    displayName: user.displayName,
  };
}

async function fetchSession() {
  const response = await apiClient.get<SessionResponse>('/auth/session/');
  return response.data;
}

async function loginRequest(input: LoginInput) {
  const response = await apiClient.post<SessionResponse>('/auth/login/', input);
  return response.data;
}

async function logoutRequest() {
  const response = await apiClient.post<SessionResponse>('/auth/logout/');
  return response.data;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      queryClient.removeQueries({ queryKey: ['submissions'] });
      queryClient.removeQueries({ queryKey: ['brokers'] });
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading: sessionQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
      isAuthenticated: Boolean(sessionQuery.data?.authenticated),
      user: normalizeUser(sessionQuery.data?.user ?? null),
      login: async (input) => {
        await loginMutation.mutateAsync(input);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    }),
    [loginMutation, logoutMutation, sessionQuery.data, sessionQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
