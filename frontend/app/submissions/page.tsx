'use client';

import Link from 'next/link';
import axios from 'axios';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Pagination,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Suspense, startTransition, useMemo } from 'react';

import AuthGate from '@/components/auth-gate';
import ReviewerShell from '@/components/reviewer-shell';
import { useAuth } from '@/lib/auth';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PRIORITY_OPTIONS: { label: string; value: SubmissionPriority | '' }[] = [
  { label: 'All priorities', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const statusTone: Record<
  SubmissionStatus,
  'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
  new: 'primary',
  in_review: 'warning',
  closed: 'success',
  lost: 'error',
};

const priorityTone: Record<SubmissionPriority, 'default' | 'info' | 'warning' | 'error'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    if (error.response?.status === 403) {
      return 'Your reviewer session is not active. Sign in again to load submissions.';
    }

    return error.response?.data?.detail ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to load submissions. Check the backend server and API base URL.';
}

function SubmissionsPageContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') as SubmissionStatus | null) ?? '';
  const priority = (searchParams.get('priority') as SubmissionPriority | null) ?? '';
  const brokerId = searchParams.get('brokerId') ?? '';
  const hasDocuments = searchParams.get('hasDocuments') === 'true';
  const hasNotes = searchParams.get('hasNotes') === 'true';
  const page = Number(searchParams.get('page') ?? '1');
  const companyQuery = searchParams.get('companySearch') ?? '';

  function replaceParams(updates: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    const query = nextParams.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  const filters = useMemo(
    () => ({
      status: status || undefined,
      priority: priority || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
      hasDocuments: hasDocuments || undefined,
      hasNotes: hasNotes || undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }),
    [status, priority, brokerId, companyQuery, hasDocuments, hasNotes, page],
  );

  const canQueryProtectedData = isAuthenticated && !isLoading;
  const submissionsQuery = useSubmissionsList(filters, { enabled: canQueryProtectedData });
  const brokerQuery = useBrokerOptions({ enabled: canQueryProtectedData });
  const submissions = submissionsQuery.data?.results ?? [];
  const totalCount = submissionsQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));
  const activeFilterCount = [
    status,
    priority,
    brokerId,
    companyQuery,
    hasDocuments,
    hasNotes,
  ].filter(Boolean).length;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Submission Tracker
            </Typography>
            <Typography color="text.secondary">
              Review incoming opportunities, filter by context, and jump into the full submission
              record.
            </Typography>
          </Box>
          <Card variant="outlined" sx={{ minWidth: 220, alignSelf: 'flex-start' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Queue snapshot
              </Typography>
              <Typography variant="h5">{totalCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                matching submissions
                {activeFilterCount ? ` across ${activeFilterCount} active filters` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(event) =>
                    replaceParams({ status: event.target.value || undefined, page: '1' })
                  }
                  fullWidth
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Priority"
                  value={priority}
                  onChange={(event) =>
                    replaceParams({ priority: event.target.value || undefined, page: '1' })
                  }
                  fullWidth
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Broker"
                  value={brokerId}
                  onChange={(event) =>
                    replaceParams({ brokerId: event.target.value || undefined, page: '1' })
                  }
                  fullWidth
                  helperText={
                    brokerQuery.isLoading
                      ? 'Loading broker options...'
                      : 'Filter by broker relationship'
                  }
                >
                  <MenuItem value="">All brokers</MenuItem>
                  {brokerQuery.data?.map((broker) => (
                    <MenuItem key={broker.id} value={String(broker.id)}>
                      {broker.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Company search"
                  value={companyQuery}
                  onChange={(event) =>
                    replaceParams({ companySearch: event.target.value || undefined, page: '1' })
                  }
                  fullWidth
                  helperText="Search name, industry, or headquarters city"
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                justifyContent="space-between"
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hasDocuments}
                        onChange={(event) =>
                          replaceParams({
                            hasDocuments: event.target.checked ? 'true' : undefined,
                            page: '1',
                          })
                        }
                      />
                    }
                    label="Has documents"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hasNotes}
                        onChange={(event) =>
                          replaceParams({
                            hasNotes: event.target.checked ? 'true' : undefined,
                            page: '1',
                          })
                        }
                      />
                    }
                    label="Has notes"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  URL-driven filters make this view shareable and interview-friendly.
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {submissionsQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Chip
                label="Retry"
                onClick={() => submissionsQuery.refetch()}
                clickable
                variant="outlined"
              />
            }
          >
            {getErrorMessage(submissionsQuery.error)}
          </Alert>
        ) : null}

        {submissionsQuery.isLoading ? (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={24} />
                <Typography color="text.secondary">Loading submissions...</Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {!submissionsQuery.isLoading && !submissions.length ? (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">No submissions matched this view</Typography>
                <Typography color="text.secondary">
                  Try clearing one or two filters or widening the company search.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Stack spacing={2}>
          {submissions.map((submission) => (
            <Card key={submission.id} variant="outlined" sx={{ overflow: 'hidden' }}>
              <CardActionArea component={Link} href={`/submissions/${submission.id}`}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="h6">{submission.company.legalName}</Typography>
                        <Typography color="text.secondary">
                          {submission.company.industry || 'Industry not provided'}
                          {submission.company.headquartersCity
                            ? ` • ${submission.company.headquartersCity}`
                            : ''}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          color={statusTone[submission.status]}
                          label={formatLabel(submission.status)}
                        />
                        <Chip
                          size="small"
                          color={priorityTone[submission.priority]}
                          variant="outlined"
                          label={`${formatLabel(submission.priority)} priority`}
                        />
                      </Stack>
                    </Stack>

                    <Typography>
                      {submission.summary || 'No submission summary provided.'}
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Broker: <strong>{submission.broker.name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Owner: <strong>{submission.owner.fullName}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created:{' '}
                          <strong>{dateFormatter.format(new Date(submission.createdAt))}</strong>
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${submission.documentCount} docs`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${submission.noteCount} notes`}
                        />
                      </Stack>
                    </Stack>

                    {submission.latestNote ? (
                      <Box sx={{ borderRadius: 2, bgcolor: 'grey.50', px: 2, py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Latest note by {submission.latestNote.authorName} on{' '}
                          {dateFormatter.format(new Date(submission.latestNote.createdAt))}
                        </Typography>
                        <Typography variant="body2">{submission.latestNote.bodyPreview}</Typography>
                      </Box>
                    ) : null}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>

        {totalPages > 1 ? (
          <Box display="flex" justifyContent="center">
            <Pagination
              color="primary"
              page={Math.min(page, totalPages)}
              count={totalPages}
              onChange={(_, value) => replaceParams({ page: String(value) })}
            />
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}

export default function SubmissionsPage() {
  return (
    <AuthGate>
      <ReviewerShell>
        <Suspense
          fallback={
            <Container maxWidth="lg" sx={{ py: 6 }}>
              <Typography color="text.secondary">Loading submissions workspace...</Typography>
            </Container>
          }
        >
          <SubmissionsPageContent />
        </Suspense>
      </ReviewerShell>
    </AuthGate>
  );
}
