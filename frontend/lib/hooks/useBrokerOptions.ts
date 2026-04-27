'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient, requireApiBaseUrl } from '@/lib/api-client';
import { Broker, PaginatedResponse } from '@/lib/types';

async function fetchBrokers() {
  requireApiBaseUrl();
  const response = await apiClient.get<PaginatedResponse<Broker>>('/brokers/');
  return response.data.results;
}

export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers,
    staleTime: 5 * 60_000,
  });
}
