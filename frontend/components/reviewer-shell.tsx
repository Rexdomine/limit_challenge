'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth';

export default function ReviewerShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(245, 247, 251, 0.85)',
        }}
      >
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography
              component={Link}
              href="/submissions"
              variant="h6"
              color="text.primary"
              sx={{ textDecoration: 'none' }}
            >
              Submission Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reviewer workspace
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="body2" color="text.secondary">
              Signed in as {user?.displayName ?? 'Reviewer'}
            </Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Log out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
}
