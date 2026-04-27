'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';

import AuthGate from '@/components/auth-gate';
import ReviewerShell from '@/components/reviewer-shell';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import {
  Contact,
  Document,
  NoteDetail,
  SubmissionDetail,
  SubmissionPriority,
  SubmissionStatus,
} from '@/lib/types';

const palette = {
  background: '#f7f9fb',
  surface: '#ffffff',
  surfaceLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  tertiaryFixed: '#d8e3fb',
  outline: '#727780',
  outlineVariant: '#c2c7d1',
  onSurface: '#191c1e',
  onSurfaceVariant: '#42474f',
  primary: '#00355f',
  primaryContainer: '#0f4c81',
  primaryFixed: '#d2e4ff',
  onPrimary: '#ffffff',
  onPrimaryFixed: '#001c37',
  secondaryContainer: '#d5e3fc',
  onSecondaryContainer: '#57657a',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
};

const detailDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timelineDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
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

function getStatusBadge(status: SubmissionStatus) {
  switch (status) {
    case 'in_review':
      return {
        label: 'In Review',
        background: palette.secondaryContainer,
        color: palette.onSecondaryContainer,
        icon: 'radio_button_checked',
      };
    case 'new':
      return {
        label: 'New',
        background: palette.primaryFixed,
        color: palette.onPrimaryFixed,
        icon: 'fiber_new',
      };
    case 'closed':
      return {
        label: 'Closed',
        background: '#dcefd8',
        color: '#295b2f',
        icon: 'task_alt',
      };
    case 'lost':
      return {
        label: 'Lost',
        background: palette.errorContainer,
        color: palette.onErrorContainer,
        icon: 'cancel',
      };
  }
}

function getPriorityBadge(priority: SubmissionPriority) {
  switch (priority) {
    case 'high':
      return {
        label: 'High Priority',
        background: palette.errorContainer,
        color: palette.onErrorContainer,
        icon: 'priority_high',
      };
    case 'medium':
      return {
        label: 'Medium Priority',
        background: '#e8edf5',
        color: palette.onSurfaceVariant,
        icon: 'flag',
      };
    case 'low':
      return {
        label: 'Low Priority',
        background: palette.primaryFixed,
        color: palette.onPrimaryFixed,
        icon: 'south',
      };
  }
}

function getDocumentIcon(document: Document) {
  const docType = document.docType.toLowerCase();
  if (docType.includes('pdf')) {
    return { icon: 'picture_as_pdf', color: palette.error };
  }
  if (docType.includes('sheet') || docType.includes('excel') || docType.includes('csv')) {
    return { icon: 'description', color: palette.onSecondaryContainer };
  }
  return { icon: 'draft', color: palette.primaryContainer };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function OverviewField({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography
        sx={{
          fontSize: 12,
          lineHeight: '16px',
          letterSpacing: '0.05em',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: palette.onSurfaceVariant,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          lineHeight: '20px',
          fontWeight: 500,
          color: accent ? palette.primary : palette.onSurface,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '4px',
          bgcolor: palette.tertiaryFixed,
          color: palette.onPrimaryFixed,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          lineHeight: '28px',
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {getInitials(contact.name)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: palette.onSurface }}
        >
          {contact.name}
        </Typography>
        <Typography
          sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant, mb: 1 }}
        >
          {contact.role || 'Role not provided'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <SymbolIcon size={16} color={palette.onSurfaceVariant}>
              mail
            </SymbolIcon>
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant }}>
              {contact.email || 'No email provided'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <SymbolIcon size={16} color={palette.onSurfaceVariant}>
              call
            </SymbolIcon>
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant }}>
              {contact.phone || 'No phone provided'}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function NotesTimeline({ notes }: { notes: NoteDetail[] }) {
  if (!notes.length) {
    return (
      <Typography sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}>
        No notes are attached to this submission.
      </Typography>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 0.5 }}>
      <Box
        sx={{
          position: 'absolute',
          left: 15,
          top: 0,
          bottom: 0,
          width: '1px',
          bgcolor: 'rgba(194, 199, 209, 0.5)',
        }}
      />
      <Stack spacing={3}>
        {notes.map((note, index) => (
          <Box key={note.id} sx={{ position: 'relative', pl: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 4,
                width: 32,
                height: 32,
                borderRadius: '999px',
                bgcolor: index === 0 ? palette.primaryFixed : palette.surfaceContainerHigh,
                color: index === 0 ? palette.onPrimaryFixed : palette.onSurface,
                border: `4px solid ${palette.surface}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <SymbolIcon size={16}>{index === 0 ? 'edit_note' : 'history'}</SymbolIcon>
            </Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              gap={1}
              sx={{ mb: 0.5 }}
            >
              <Typography
                sx={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: palette.onSurface }}
              >
                {note.authorName}
              </Typography>
              <Typography
                sx={{ fontSize: 12, lineHeight: '16px', color: palette.onSurfaceVariant }}
              >
                {timelineDateFormatter.format(new Date(note.createdAt))}
              </Typography>
            </Stack>
            <Box
              sx={{
                bgcolor: index === 0 ? palette.surfaceContainer : 'transparent',
                border: index === 0 ? `1px solid rgba(194, 199, 209, 0.3)` : 'none',
                borderRadius: '4px',
                p: index === 0 ? 2 : 0,
              }}
            >
              <Typography
                sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant }}
              >
                {note.body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function DetailsContent({ submission }: { submission: SubmissionDetail }) {
  const status = getStatusBadge(submission.status);
  const priority = getPriorityBadge(submission.priority);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.background }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box
            component={Link}
            href="/submissions"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              width: 'fit-content',
              textDecoration: 'none',
              color: palette.onSurfaceVariant,
              transition: 'color 160ms ease',
              '&:hover': { color: palette.primary },
            }}
          >
            <SymbolIcon size={16}>arrow_back</SymbolIcon>
            <Typography sx={{ fontSize: 13, lineHeight: '18px' }}>All Submissions</Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 30,
                  lineHeight: '38px',
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  color: palette.onSurface,
                  mb: 0.5,
                }}
              >
                {submission.company.legalName}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <SymbolIcon size={16} color={palette.onSurfaceVariant}>
                    factory
                  </SymbolIcon>
                  <Typography
                    sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                  >
                    {submission.company.industry || 'Industry not provided'}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '999px',
                    bgcolor: palette.outlineVariant,
                  }}
                />
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  ID: SUB-{String(submission.id).padStart(4, '0')}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: '4px',
                  bgcolor: status.background,
                  color: status.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{ width: 8, height: 8, borderRadius: '999px', bgcolor: palette.primary }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    lineHeight: '16px',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {status.label}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: '4px',
                  bgcolor: priority.background,
                  color: priority.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <SymbolIcon size={14} color={priority.color}>
                  {priority.icon}
                </SymbolIcon>
                <Typography
                  sx={{
                    fontSize: 12,
                    lineHeight: '16px',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {priority.label}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ borderBottom: `1px solid ${palette.outlineVariant}`, pb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<SymbolIcon size={18}>swap_horiz</SymbolIcon>}
              sx={{
                bgcolor: palette.primary,
                color: palette.onPrimary,
                borderRadius: '4px',
                textTransform: 'none',
                boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
                '&:hover': { bgcolor: palette.primaryContainer },
              }}
            >
              Change Status
            </Button>
            <Button
              variant="outlined"
              startIcon={<SymbolIcon size={18}>note_add</SymbolIcon>}
              sx={{
                borderColor: palette.outlineVariant,
                color: palette.onSurface,
                borderRadius: '4px',
                textTransform: 'none',
                '&:hover': { borderColor: palette.primaryContainer, bgcolor: palette.surfaceLow },
              }}
            >
              Add Note
            </Button>
            <Button
              variant="outlined"
              startIcon={<SymbolIcon size={18}>download</SymbolIcon>}
              sx={{
                ml: { md: 'auto' },
                borderColor: palette.outlineVariant,
                color: palette.onSurface,
                borderRadius: '4px',
                textTransform: 'none',
                '&:hover': { borderColor: palette.primaryContainer, bgcolor: palette.surfaceLow },
              }}
            >
              Download All
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,8fr) minmax(320px,4fr)' },
              gap: 2.5,
            }}
          >
            <Stack spacing={3}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: palette.outlineVariant,
                  borderRadius: '4px',
                  boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      lineHeight: '28px',
                      fontWeight: 600,
                      color: palette.onSurface,
                      mb: 2,
                    }}
                  >
                    Overview
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 3,
                    }}
                  >
                    <OverviewField
                      label="Location"
                      value={submission.company.headquartersCity || 'Location not provided'}
                    />
                    <OverviewField label="Broker" value={submission.broker.name} />
                    <OverviewField
                      label="Internal Owner"
                      value={submission.owner.fullName}
                      accent
                    />
                    <OverviewField
                      label="Created Date"
                      value={detailDateFormatter.format(new Date(submission.createdAt))}
                    />
                  </Box>
                </Box>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  borderColor: palette.outlineVariant,
                  borderRadius: '4px',
                  boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      sx={{
                        fontSize: 20,
                        lineHeight: '28px',
                        fontWeight: 600,
                        color: palette.onSurface,
                      }}
                    >
                      Contacts
                    </Typography>
                    <Button sx={{ minWidth: 0, p: 0.5, color: palette.primary }}>
                      <SymbolIcon>add</SymbolIcon>
                    </Button>
                  </Stack>
                  {submission.contacts.length ? (
                    <Box>
                      {submission.contacts.map((contact, index) => (
                        <Box key={contact.id}>
                          {index ? (
                            <Divider sx={{ borderColor: 'rgba(194, 199, 209, 0.5)' }} />
                          ) : null}
                          <ContactRow contact={contact} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                    >
                      No contacts are attached to this submission.
                    </Typography>
                  )}
                </Box>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  borderColor: palette.outlineVariant,
                  borderRadius: '4px',
                  boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      lineHeight: '28px',
                      fontWeight: 600,
                      color: palette.onSurface,
                      mb: 2,
                    }}
                  >
                    Documents
                  </Typography>
                  {submission.documents.length ? (
                    <Box
                      sx={{
                        border: `1px solid rgba(194, 199, 209, 0.5)`,
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'grid' },
                          gridTemplateColumns: 'minmax(0,1fr) 160px 160px 80px',
                          bgcolor: palette.surfaceLow,
                          borderBottom: `1px solid rgba(194, 199, 209, 0.5)`,
                        }}
                      >
                        {['File Name', 'Type', 'Date', 'Action'].map((label, index) => (
                          <Typography
                            key={label}
                            sx={{
                              px: 2,
                              py: 1.5,
                              fontSize: 12,
                              lineHeight: '16px',
                              letterSpacing: '0.05em',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: palette.onSurfaceVariant,
                              textAlign: index === 3 ? 'right' : 'left',
                            }}
                          >
                            {label}
                          </Typography>
                        ))}
                      </Box>
                      {submission.documents.map((document, index) => {
                        const fileMeta = getDocumentIcon(document);
                        return (
                          <Box
                            key={document.id}
                            sx={{
                              borderTop: index ? `1px solid rgba(194, 199, 209, 0.5)` : 'none',
                              '&:hover': { bgcolor: palette.surfaceLow },
                            }}
                          >
                            <Box
                              sx={{
                                display: { xs: 'block', md: 'grid' },
                                gridTemplateColumns: 'minmax(0,1fr) 160px 160px 80px',
                                px: 2,
                                py: 1.5,
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <SymbolIcon size={20} color={fileMeta.color}>
                                  {fileMeta.icon}
                                </SymbolIcon>
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    lineHeight: '20px',
                                    color: palette.onSurface,
                                  }}
                                >
                                  {document.title}
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  mt: { xs: 1, md: 0 },
                                  fontSize: 13,
                                  lineHeight: '18px',
                                  color: palette.onSurfaceVariant,
                                }}
                              >
                                {document.docType}
                              </Typography>
                              <Typography
                                sx={{
                                  mt: { xs: 0.5, md: 0 },
                                  fontSize: 14,
                                  lineHeight: '20px',
                                  color: palette.onSurfaceVariant,
                                }}
                              >
                                {detailDateFormatter.format(new Date(document.uploadedAt))}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                  mt: { xs: 1, md: 0 },
                                }}
                              >
                                {document.fileUrl ? (
                                  <Box
                                    component="a"
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{ color: palette.outline, display: 'inline-flex' }}
                                  >
                                    <SymbolIcon size={20}>download</SymbolIcon>
                                  </Box>
                                ) : (
                                  <SymbolIcon size={20} color={palette.outline}>
                                    download
                                  </SymbolIcon>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography
                      sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                    >
                      No documents are attached to this submission.
                    </Typography>
                  )}
                </Box>
              </Card>
            </Stack>

            <Card
              variant="outlined"
              sx={{
                borderColor: palette.outlineVariant,
                borderRadius: '4px',
                boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
                alignSelf: 'start',
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    lineHeight: '28px',
                    fontWeight: 600,
                    color: palette.onSurface,
                    mb: 3,
                  }}
                >
                  Notes & Timeline
                </Typography>
                <NotesTimeline notes={submission.notes} />
              </Box>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';
  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;
  const diagnosticsMessage =
    detailQuery.error instanceof Error
      ? detailQuery.error.message
      : 'ERR_CONNECTION_TIMEOUT: Upstream server did not respond.';

  return (
    <AuthGate>
      <ReviewerShell>
        {detailQuery.isLoading ? (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Card
              variant="outlined"
              sx={{ borderColor: palette.outlineVariant, borderRadius: '4px' }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2.5 }}>
                <CircularProgress size={24} />
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  Loading submission details...
                </Typography>
              </Stack>
            </Card>
          </Container>
        ) : null}

        {detailQuery.isError ? (
          <Container
            maxWidth={false}
            sx={{
              px: { xs: 2, md: 3 },
              py: 3,
              minHeight: 'calc(100vh - 64px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: 560,
                borderColor: palette.outlineVariant,
                borderRadius: '4px',
                boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack spacing={3} alignItems="center" sx={{ px: 4, py: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '999px',
                    bgcolor: palette.errorContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SymbolIcon size={32} color={palette.error}>
                    warning
                  </SymbolIcon>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 24,
                      lineHeight: '32px',
                      letterSpacing: '-0.01em',
                      fontWeight: 600,
                      color: palette.onSurface,
                      mb: 1,
                    }}
                  >
                    Failed to load submission
                  </Typography>
                  <Typography
                    sx={{
                      px: { xs: 0, sm: 2 },
                      fontSize: 14,
                      lineHeight: '20px',
                      color: palette.onSurfaceVariant,
                    }}
                  >
                    We encountered an unexpected error while retrieving the data package. This could
                    be due to a temporary network disruption or a data integrity check failure.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    bgcolor: palette.background,
                    border: `1px solid ${palette.outlineVariant}`,
                    borderRadius: '4px',
                    p: 1.5,
                    textAlign: 'left',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <SymbolIcon size={16} color={palette.onSurfaceVariant}>
                      terminal
                    </SymbolIcon>
                    <Typography
                      sx={{
                        fontSize: 12,
                        lineHeight: '16px',
                        letterSpacing: '0.05em',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: palette.onSurfaceVariant,
                      }}
                    >
                      Diagnostics
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 12,
                      lineHeight: '16px',
                      color: palette.onSecondaryContainer,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {diagnosticsMessage}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    component={Link}
                    href="/submissions"
                    variant="outlined"
                    sx={{
                      borderColor: palette.outlineVariant,
                      color: palette.onSurface,
                      borderRadius: '4px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: palette.primaryContainer,
                        bgcolor: palette.surfaceContainerHigh,
                      },
                    }}
                  >
                    Return to List
                  </Button>
                  <Button
                    onClick={() => detailQuery.refetch()}
                    variant="contained"
                    startIcon={<SymbolIcon size={18}>refresh</SymbolIcon>}
                    sx={{
                      bgcolor: palette.primary,
                      color: palette.onPrimary,
                      borderRadius: '4px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: palette.primaryContainer },
                    }}
                  >
                    Retry Connection
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Container>
        ) : null}

        {submission ? <DetailsContent submission={submission} /> : null}
      </ReviewerShell>
    </AuthGate>
  );
}
