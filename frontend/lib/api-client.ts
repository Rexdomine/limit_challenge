import axios from 'axios';

const HOSTED_PROXY_BASE_URL = '/api/backend';
const LOCAL_API_BASE_URL = 'http://localhost:8000/api';

function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
      if (configuredBaseUrl) {
        return normalizeBaseUrl(configuredBaseUrl);
      }

      return LOCAL_API_BASE_URL;
    }

    return HOSTED_PROXY_BASE_URL;
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  return '';
}

export const apiBaseUrl = resolveApiBaseUrl();

export function requireApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error('API base URL could not be resolved.');
  }

  return apiBaseUrl;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 15_000,
  withCredentials: true,
});
