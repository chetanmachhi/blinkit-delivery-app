import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';
import { ResponseModel } from './types';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  // Free-tier hosting can cold-start slowly; keep the first call alive.
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<ResponseModel>) => {
    const status = error.response?.status ?? 0;
    const isLogin = error.config?.url?.includes('/auth/login');

    // Session expired or rider deactivated: back to login.
    if (status === 401 && !isLogin) {
      useAuthStore.getState().signOut();
    }

    const message =
      error.response?.data?.message ||
      (status === 0
        ? `Cannot reach the server at ${env.API_ORIGIN}. Is the backend running?`
        : 'Something went wrong. Please try again.');

    return Promise.reject(new ApiError(message, status));
  },
);

/** Unwraps the ResponseModel envelope. */
export const unwrap = <T>(res: { data: ResponseModel<T> }): T => res.data.data as T;

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong';
