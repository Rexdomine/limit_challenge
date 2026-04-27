'use client';

import Link from 'next/link';
import axios from 'axios';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Suspense, startTransition, useMemo } from 'react';

import AuthGate from '@/components/auth-gate';
import ReviewerShell from '@/components/reviewer-shell';
import { useAuth } from '@/lib/auth';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionListItem, SubmissionPriority, SubmissionStatus } from '@/lib/types';

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

const palette = {
  background: '#f7f9fb',
  surface: '#ffffff',
  surfaceBright: '#f7f9fb',
  surfaceLow: '#f2f4f6',
  outline: '#727780',
  outlineVariant: '#c2c7d1',
  onSurface: '#191c1e',
  onSurfaceVariant: '#42474f',
  primary: '#00355f',
  primaryContainer: '#0f4c81',
  primaryFixed: '#d2e4ff',
  primaryFixedDim: '#a0c9ff',
  onPrimaryFixed: '#001c37',
  secondary: '#515f74',
  secondaryFixed: '#d5e3fc',
  onSecondaryFixedVariant: '#3a485b',
  error: '#ba1a1a',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function SymbolIcon({
  children,
  fill = false,
  size = 20,
  color,
}: {
  children: string;
  fill?: boolean;
  size?: number;
  color?: string;
}) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{
        fontSize: size,
        lineHeight: 1,
        color,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {children}
    </Box>
  );
}

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

function getStatusBadge(status: SubmissionStatus) {
  switch (status) {
    case 'in_review':
      return {
        label: 'In Review',
        background: palette.secondaryFixed,
        color: palette.onSecondaryFixedVariant,
      };
    case 'new':
      return {
        label: 'New',
        background: palette.primaryFixedDim,
        color: palette.onPrimaryFixed,
      };
    case 'closed':
      return {
        label: 'Closed',
        background: '#dcefd8',
        color: '#295b2f',
      };
    case 'lost':
      return {
        label: 'Lost',
        background: '#ffdad6',
        color: '#93000a',
      };
  }
}

function getPriorityMeta(priority: SubmissionPriority) {
  switch (priority) {
    case 'high':
      return { label: 'High', color: palette.error };
    case 'medium':
      return { label: 'Medium', color: palette.secondary };
    case 'low':
      return { label: 'Low', color: palette.primaryContainer };
  }
}

function ToggleButton({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="text"
      onClick={onClick}
      startIcon={
        checked ? (
          <SymbolIcon size={18} color={palette.primaryContainer}>
            check_box
          </SymbolIcon>
        ) : (
          <SymbolIcon size={18} color={palette.outline}>
            check_box_outline_blank
          </SymbolIcon>
        )
      }
      sx={{
        px: 0,
        minWidth: 0,
        color: checked ? palette.onSurface : palette.onSurfaceVariant,
        textTransform: 'none',
        fontSize: 13,
        lineHeight: '18px',
        fontWeight: 400,
        '&:hover': { bgcolor: 'transparent', color: palette.primaryContainer },
      }}
    >
      {label}
    </Button>
  );
}

function SubmissionCard({ submission }: { submission: SubmissionListItem }) {
  const status = getStatusBadge(submission.status);
  const priority = getPriorityMeta(submission.priority);

  return (
    <Box
      component={Link}
      href={`/submissions/${submission.id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: '4px',
          borderColor: palette.outlineVariant,
          bgcolor: palette.surface,
          transition: 'background-color 160ms ease, border-color 160ms ease',
          '&:hover': {
            bgcolor: '#f1f5f9',
            borderColor: palette.primaryFixedDim,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0,4fr) minmax(0,2fr) minmax(0,2fr) minmax(0,3fr) auto',
            },
            gap: 2.5,
            px: 2,
            py: 1.5,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 20,
                lineHeight: '28px',
                letterSpacing: '-0.01em',
                fontWeight: 600,
                color: palette.onSurface,
              }}
            >
              {submission.company.legalName}
            </Typography>
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant }}>
              {submission.company.industry || 'Industry not provided'}
              {submission.company.headquartersCity
                ? ` • ${submission.company.headquartersCity}`
                : ''}
            </Typography>
          </Box>

          <Box>
            <Chip
              label={status.label}
              sx={{
                height: 24,
                borderRadius: '4px',
                bgcolor: status.background,
                color: status.color,
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 500,
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '999px',
                bgcolor: priority.color,
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurface }}>
              {priority.label}
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography
                sx={{ fontSize: 12, lineHeight: '16px', color: palette.onSurfaceVariant }}
              >
                Brk: {submission.broker.name}
              </Typography>
              <Typography
                sx={{ fontSize: 12, lineHeight: '16px', color: palette.onSurfaceVariant }}
              >
                {dateFormatter.format(new Date(submission.createdAt))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography sx={{ fontSize: 12, lineHeight: '16px', color: palette.outline }}>
                Own: {submission.owner.fullName}
              </Typography>
              <Stack direction="row" spacing={1.25}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <SymbolIcon size={14} color={palette.outline}>
                    description
                  </SymbolIcon>
                  <Typography sx={{ fontSize: 12, lineHeight: '16px', color: palette.outline }}>
                    {submission.documentCount}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <SymbolIcon size={14} color={palette.outline}>
                    chat_bubble_outline
                  </SymbolIcon>
                  <Typography sx={{ fontSize: 12, lineHeight: '16px', color: palette.outline }}>
                    {submission.noteCount}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            <SymbolIcon size={20} color={palette.outline}>
              more_vert
            </SymbolIcon>
          </Box>
        </Box>

        {submission.latestNote ? (
          <Box
            sx={{
              borderTop: `1px solid ${palette.outlineVariant}`,
              bgcolor: palette.surfaceLow,
              px: 2,
              py: 1.5,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            <SymbolIcon size={16} color={palette.outline}>
              format_quote
            </SymbolIcon>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: '18px',
                  color: palette.onSurfaceVariant,
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                &quot;{submission.latestNote.bodyPreview}&quot;
              </Typography>
              <Typography
                sx={{ mt: 0.5, fontSize: 11, lineHeight: '16px', color: palette.outline }}
              >
                {`— ${submission.latestNote.authorName}, ${dateFormatter.format(
                  new Date(submission.latestNote.createdAt),
                )}`}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Card>
    </Box>
  );
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
    Boolean(status),
    Boolean(priority),
    Boolean(brokerId),
    Boolean(companyQuery),
    hasDocuments,
    hasNotes,
  ].filter(Boolean).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.background }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 3,
          borderBottom: `1px solid ${palette.outlineVariant}`,
          bgcolor: palette.surface,
        }}
      >
        <Container maxWidth={false} sx={{ px: '0 !important' }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'flex-end' }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    lineHeight: '32px',
                    letterSpacing: '-0.01em',
                    fontWeight: 600,
                    color: palette.onSurface,
                    mb: 0.5,
                  }}
                >
                  Submissions
                </Typography>
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  Manage and track active operational submissions.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.75,
                    borderRadius: '4px',
                    bgcolor: palette.surfaceLow,
                    border: `1px solid ${palette.outlineVariant}`,
                  }}
                >
                  <SymbolIcon size={18} color={palette.onSurfaceVariant}>
                    filter_list
                  </SymbolIcon>
                  <Typography
                    sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                  >
                    {activeFilterCount} Active
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.75,
                    borderRadius: '4px',
                    bgcolor: palette.primaryFixed,
                    border: `1px solid ${palette.primaryFixedDim}`,
                  }}
                >
                  <SymbolIcon size={18} color={palette.primary}>
                    database
                  </SymbolIcon>
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', color: palette.primary }}>
                    {totalCount} Total Matches
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', xl: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', xl: 'center' }}
            >
              <TextField
                value={companyQuery}
                onChange={(event) =>
                  replaceParams({ companySearch: event.target.value || undefined, page: '1' })
                }
                placeholder="Search by company..."
                size="small"
                sx={{
                  width: { xs: '100%', md: 320 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    bgcolor: palette.surfaceBright,
                    '& fieldset': { borderColor: palette.outlineVariant },
                    '&:hover fieldset': { borderColor: palette.primary },
                    '&.Mui-focused fieldset': { borderColor: palette.primary },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 13,
                    lineHeight: '18px',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SymbolIcon size={20} color={palette.outline}>
                        search
                      </SymbolIcon>
                    </InputAdornment>
                  ),
                  endAdornment: companyQuery ? (
                    <InputAdornment position="end">
                      <Button
                        onClick={() => replaceParams({ companySearch: undefined, page: '1' })}
                        sx={{
                          minWidth: 0,
                          px: 0,
                          color: palette.outline,
                        }}
                      >
                        <SymbolIcon size={16}>close</SymbolIcon>
                      </Button>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  select
                  size="small"
                  value={status}
                  onChange={(event) =>
                    replaceParams({ status: event.target.value || undefined, page: '1' })
                  }
                  sx={{
                    minWidth: 132,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: palette.surfaceBright,
                      '& fieldset': { borderColor: palette.outlineVariant },
                    },
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.value ? formatLabel(option.value) : 'Status'}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  value={priority}
                  onChange={(event) =>
                    replaceParams({ priority: event.target.value || undefined, page: '1' })
                  }
                  sx={{
                    minWidth: 132,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: palette.surfaceBright,
                      '& fieldset': { borderColor: palette.outlineVariant },
                    },
                  }}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.value ? formatLabel(option.value) : 'Priority'}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  value={brokerId}
                  onChange={(event) =>
                    replaceParams({ brokerId: event.target.value || undefined, page: '1' })
                  }
                  sx={{
                    minWidth: 148,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      bgcolor: palette.surfaceBright,
                      '& fieldset': { borderColor: palette.outlineVariant },
                    },
                  }}
                >
                  <MenuItem value="">Broker</MenuItem>
                  {brokerQuery.data?.map((broker) => (
                    <MenuItem key={broker.id} value={String(broker.id)}>
                      {broker.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                  borderLeft: { xl: `1px solid ${palette.outlineVariant}` },
                  pl: { xl: 2 },
                  ml: { xl: 0.5 },
                }}
              >
                <ToggleButton
                  label="Has Documents"
                  checked={hasDocuments}
                  onClick={() =>
                    replaceParams({
                      hasDocuments: hasDocuments ? undefined : 'true',
                      page: '1',
                    })
                  }
                />
                <ToggleButton
                  label="Has Notes"
                  checked={hasNotes}
                  onClick={() =>
                    replaceParams({
                      hasNotes: hasNotes ? undefined : 'true',
                      page: '1',
                    })
                  }
                />
              </Stack>

              <Button
                onClick={() =>
                  replaceParams({
                    status: undefined,
                    priority: undefined,
                    brokerId: undefined,
                    companySearch: undefined,
                    hasDocuments: undefined,
                    hasNotes: undefined,
                    page: undefined,
                  })
                }
                sx={{
                  ml: { xl: 'auto' },
                  px: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontSize: 13,
                  lineHeight: '18px',
                  color: palette.primary,
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  '&:hover': { bgcolor: 'transparent', color: palette.primaryContainer },
                }}
              >
                Clear all
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: { xs: 'none', lg: 'grid' },
              gridTemplateColumns: 'minmax(0,4fr) minmax(0,2fr) minmax(0,2fr) minmax(0,3fr) auto',
              gap: 2.5,
              px: 2,
              pb: 1,
              borderBottom: `1px solid ${palette.outlineVariant}`,
            }}
          >
            {['Company & Location', 'Status', 'Priority', 'Metadata', 'Actions'].map(
              (label, index) => (
                <Typography
                  key={label}
                  sx={{
                    fontSize: 12,
                    lineHeight: '16px',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: palette.outline,
                    textAlign: index === 4 ? 'right' : 'left',
                  }}
                >
                  {label}
                </Typography>
              ),
            )}
          </Box>

          {submissionsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => submissionsQuery.refetch()}>
                  Retry
                </Button>
              }
              sx={{ borderRadius: '4px' }}
            >
              {getErrorMessage(submissionsQuery.error)}
            </Alert>
          ) : null}

          {brokerQuery.isError ? (
            <Alert severity="warning" sx={{ borderRadius: '4px' }}>
              Broker filters could not be loaded. Submission data is still available.
            </Alert>
          ) : null}

          {submissionsQuery.isLoading ? (
            <Card
              variant="outlined"
              sx={{
                borderRadius: '4px',
                borderColor: palette.outlineVariant,
                bgcolor: palette.surface,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2.5 }}>
                <CircularProgress size={24} />
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  Loading submissions...
                </Typography>
              </Stack>
            </Card>
          ) : null}

          {!submissionsQuery.isLoading && !submissions.length ? (
            <Card
              variant="outlined"
              sx={{
                borderRadius: '4px',
                borderColor: palette.outlineVariant,
                bgcolor: palette.surface,
              }}
            >
              <Stack spacing={1} sx={{ px: 3, py: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    lineHeight: '28px',
                    fontWeight: 600,
                    color: palette.onSurface,
                  }}
                >
                  No submissions matched this view
                </Typography>
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  Try clearing one or two filters or widening the company search.
                </Typography>
              </Stack>
            </Card>
          ) : null}

          {!submissionsQuery.isLoading
            ? submissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))
            : null}

          {totalPages > 1 ? (
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              {Array.from({ length: totalPages }, (_, index) => {
                const nextPage = index + 1;
                const isActive = nextPage === Math.min(page, totalPages);
                return (
                  <Button
                    key={nextPage}
                    onClick={() => replaceParams({ page: String(nextPage) })}
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '4px',
                      border: `1px solid ${isActive ? palette.primaryFixedDim : palette.outlineVariant}`,
                      bgcolor: isActive ? palette.primaryFixed : palette.surface,
                      color: isActive ? palette.primary : palette.onSurfaceVariant,
                      textTransform: 'none',
                      fontWeight: isActive ? 600 : 400,
                      '&:hover': {
                        bgcolor: isActive ? palette.primaryFixed : palette.surfaceLow,
                      },
                    }}
                  >
                    {nextPage}
                  </Button>
                );
              })}
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </Box>
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
