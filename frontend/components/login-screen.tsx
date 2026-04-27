'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useAuth } from '@/lib/auth';

const DEMO_USERNAME = 'reviewer';
const DEMO_PASSWORD = 'limit-review-2026';

export default function LoginScreen() {
  const { isAuthenticated, isLoading, login, authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(DEMO_USERNAME);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const nextPath = searchParams.get('next') || '/submissions';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login({ username, password });
    router.replace(nextPath);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(15, 98, 254, 0.14), transparent 32%), linear-gradient(160deg, #f5f7fb 0%, #eef4ff 48%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          display="grid"
          gap={4}
          sx={{
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(360px, 440px)' },
            alignItems: 'center',
          }}
        >
          <Stack spacing={3}>
            <Chip
              label="Interview review access"
              color="primary"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontSize: { xs: '2.6rem', md: '4rem' },
                  lineHeight: 1.02,
                  letterSpacing: '-0.04em',
                  maxWidth: 620,
                }}
              >
                Broker submissions, behind a clean reviewer login.
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 2, maxWidth: 560, fontSize: { xs: '1rem', md: '1.1rem' } }}
              >
                This access layer keeps the working review experience intact while making the app
                presentable for a real interview handoff and walkthrough.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              useFlexGap
              flexWrap="wrap"
            >
              <Chip variant="outlined" label="Session-based auth" />
              <Chip variant="outlined" label="Login-only scope" />
              <Chip variant="outlined" label="Demo credentials included" />
            </Stack>
          </Stack>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Reviewer login
                  </Typography>
                  <Typography color="text.secondary">
                    Use the prefilled demo account or override the backend credentials with env vars
                    before launch.
                  </Typography>
                </Box>

                <Alert severity="info">
                  Username: <strong>{DEMO_USERNAME}</strong>
                  {'  '}
                  Password: <strong>{DEMO_PASSWORD}</strong>
                </Alert>

                {isAuthenticated ? (
                  <Alert
                    severity="success"
                    action={
                      <Button onClick={() => router.push(nextPath)}>Go to Submissions</Button>
                    }
                  >
                    Reviewer session already active. Continue to the workspace when ready.
                  </Alert>
                ) : null}

                {authError ? <Alert severity="error">{authError}</Alert> : null}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      fullWidth
                    />
                    <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                      {isLoading
                        ? 'Signing in...'
                        : isAuthenticated
                          ? 'Refresh reviewer session'
                          : 'Open reviewer workspace'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
