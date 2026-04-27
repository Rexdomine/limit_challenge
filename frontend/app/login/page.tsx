'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

import LoginScreen from '@/components/login-screen';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}
