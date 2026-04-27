'use client';

import Link from 'next/link';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

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

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';
  const detailQuery = useSubmissionDetail(submissionId);
  const submission = detailQuery.data;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box
          display="flex"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <div>
            <Typography variant="h4">Submission detail</Typography>
            <Typography color="text.secondary">
              Full submission context for broker review, contacts, documents, and collaborative
              notes.
            </Typography>
          </div>
          <MuiLink component={Link} href="/submissions" underline="none">
            Back to list
          </MuiLink>
        </Box>

        {detailQuery.isLoading ? (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={24} />
                <Typography color="text.secondary">Loading submission details...</Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {detailQuery.isError ? (
          <Alert severity="error">Failed to load the submission detail view.</Alert>
        ) : null}

        {submission ? (
          <>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="h5">{submission.company.legalName}</Typography>
                      <Typography color="text.secondary">
                        {submission.company.industry || 'Industry not provided'}
                        {submission.company.headquartersCity
                          ? ` • ${submission.company.headquartersCity}`
                          : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        color={statusTone[submission.status]}
                        label={formatLabel(submission.status)}
                      />
                      <Chip
                        color={priorityTone[submission.priority]}
                        variant="outlined"
                        label={`${formatLabel(submission.priority)} priority`}
                      />
                    </Stack>
                  </Stack>

                  <Typography>
                    {submission.summary || 'No summary was provided for this submission.'}
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box flex={1}>
                      <Typography variant="overline" color="text.secondary">
                        Broker
                      </Typography>
                      <Typography>{submission.broker.name}</Typography>
                      <Typography color="text.secondary">
                        {submission.broker.primaryContactEmail || 'No email provided'}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="overline" color="text.secondary">
                        Internal owner
                      </Typography>
                      <Typography>{submission.owner.fullName}</Typography>
                      <Typography color="text.secondary">{submission.owner.email}</Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="overline" color="text.secondary">
                        Timeline
                      </Typography>
                      <Typography>
                        Created {dateFormatter.format(new Date(submission.createdAt))}
                      </Typography>
                      <Typography color="text.secondary">
                        Updated {dateFormatter.format(new Date(submission.updatedAt))}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Primary contacts
                </Typography>
                {submission.contacts.length ? (
                  <List disablePadding>
                    {submission.contacts.map((contact, index) => (
                      <Box key={contact.id}>
                        {index ? <Divider /> : null}
                        <ListItem disableGutters>
                          <ListItemText
                            primary={contact.name}
                            secondary={`${contact.role || 'Role not provided'} • ${contact.email || 'No email'} • ${contact.phone || 'No phone'}`}
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No contacts are attached to this submission.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Supporting documents
                </Typography>
                {submission.documents.length ? (
                  <List disablePadding>
                    {submission.documents.map((document, index) => (
                      <Box key={document.id}>
                        {index ? <Divider /> : null}
                        <ListItem disableGutters>
                          <ListItemText
                            primary={document.title}
                            secondary={`${document.docType} • Uploaded ${dateFormatter.format(new Date(document.uploadedAt))}`}
                          />
                          {document.fileUrl ? (
                            <MuiLink
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                            >
                              Open
                            </MuiLink>
                          ) : null}
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No documents are attached to this submission.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes timeline
                </Typography>
                {submission.notes.length ? (
                  <Stack spacing={2}>
                    {submission.notes.map((note) => (
                      <Box key={note.id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}>
                        <Typography variant="subtitle2">{note.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dateFormatter.format(new Date(note.createdAt))}
                        </Typography>
                        <Typography sx={{ mt: 0.75 }}>{note.body}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No notes are attached to this submission.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
