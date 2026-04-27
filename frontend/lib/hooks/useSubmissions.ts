'use client';

import { useMemo } from 'react';
import { keepPreviousData, QueryKey, useQuery } from '@tanstack/react-query';

import { apiClient, requireApiBaseUrl } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';

const SUBMISSIONS_QUERY_KEY = 'submissions';

async function fetchSubmissions(filters: SubmissionListFilters) {
  requireApiBaseUrl();
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: {
      status: filters.status,
      priority: filters.priority,
      brokerId: filters.brokerId,
      companySearch: filters.companySearch,
      hasDocuments: filters.hasDocuments,
      hasNotes: filters.hasNotes,
      page: filters.page,
    },
  });
  return response.data;
}

async function fetchSubmissionDetail(id: string | number) {
  if (!id) {
    throw new Error('Submission id is required');
  }

  requireApiBaseUrl();
  const response = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`);
  return response.data;
}

interface QueryOptions {
  enabled?: boolean;
}

export function useSubmissionsList(filters: SubmissionListFilters, options?: QueryOptions) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, filters] as QueryKey,
    queryFn: () => fetchSubmissions(filters),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useSubmissionDetail(id: string | number, options?: QueryOptions) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, id],
    queryFn: () => fetchSubmissionDetail(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 60_000,
  });
}

export function useSubmissionQueryKey(filters: SubmissionListFilters) {
  return useMemo(() => [SUBMISSIONS_QUERY_KEY, filters] as QueryKey, [filters]);
}
