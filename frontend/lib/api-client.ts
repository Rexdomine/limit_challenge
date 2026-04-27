import axios from 'axios';

const LOCAL_API_BASE_URL = 'http://localhost:8000/api';

function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API_BASE_URL;
    }
  }

  return '';
}

export const apiBaseUrl = resolveApiBaseUrl();

export function requireApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is required for hosted deployments. Set it to the public backend /api URL.',
    );
  }

  return apiBaseUrl;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 15_000,
  withCredentials: true,
});
