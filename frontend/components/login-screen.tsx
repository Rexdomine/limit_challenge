'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useAuth } from '@/lib/auth';

const DEMO_USERNAME = 'reviewer';
const DEMO_PASSWORD = 'limit-review-2026';
const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDoUqzL4TKYKeetvxlz6SFvCmhNbcH_bB7Z9SNF3vgRdI3uGW5ICKzSB4ph0bq0qMh1Rgq0b7Z-VmDWMjo6I6VxBK1ti_nfO8s4LtVutI3-zxtCGt8duiSAFIkdgxZtv2E1G3iMWv3mR3DwNm3DaY9F1Mu2DQivTQp1BZzI4mYzc08VgZSoPpiLuxT3-owu4KqGeQvhCtmDYAkAT_NsUoeAn3zWnEe0nqSeGoWatBm9DrYu2rkf7_W0fdCZTiD6fCax5gDZIRvA6bI';

const palette = {
  background: '#f7f9fb',
  surface: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceVariant: '#e0e3e5',
  outlineVariant: '#c2c7d1',
  outline: '#727780',
  onSurface: '#191c1e',
  onSurfaceVariant: '#42474f',
  primaryContainer: '#0f4c81',
  primary: '#00355f',
  onPrimary: '#ffffff',
  tertiaryFixedDim: '#bcc7de',
  tertiary: '#293447',
  error: '#ba1a1a',
};

function SymbolIcon({
  children,
  size = 24,
  color,
}: {
  children: string;
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
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden="true"
    >
      {children}
    </Box>
  );
}

export default function LoginScreen() {
  const { isAuthenticated, isLoading, login, authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(DEMO_USERNAME);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(true);
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
        display: 'flex',
        bgcolor: palette.background,
        color: palette.onSurface,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', lg: '40%' },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: 8, lg: 10, xl: 14 },
          py: 6,
          bgcolor: palette.surface,
          position: 'relative',
          zIndex: 1,
          boxShadow: { lg: '4px 0 24px rgba(15, 23, 42, 0.05)' },
          borderRight: { lg: `1px solid ${palette.surfaceVariant}` },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 448, mx: 'auto' }}>
          <Box sx={{ mb: 8 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <SymbolIcon size={36} color={palette.primaryContainer}>
                data_exploration
              </SymbolIcon>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 28, md: 30 },
                  lineHeight: { xs: '36px', md: '38px' },
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  color: palette.onSurface,
                }}
              >
                Submission Tracker
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: '24px',
                color: palette.onSurfaceVariant,
                maxWidth: '90%',
              }}
            >
              Review broker-submitted opportunities with clarity and speed.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
            <Alert
              severity="info"
              sx={{
                borderRadius: 1,
                bgcolor: '#eef4ff',
                color: palette.primary,
                '& .MuiAlert-icon': { color: palette.primaryContainer },
              }}
            >
              Demo sign-in uses username <strong>{DEMO_USERNAME}</strong> and password{' '}
              <strong>{DEMO_PASSWORD}</strong>.
            </Alert>

            {isAuthenticated ? (
              <Alert
                severity="success"
                action={
                  <Button color="inherit" size="small" onClick={() => router.push(nextPath)}>
                    Continue
                  </Button>
                }
                sx={{ borderRadius: 1 }}
              >
                Reviewer session already active.
              </Alert>
            ) : null}

            {authError ? (
              <Alert severity="error" sx={{ borderRadius: 1 }}>
                {authError}
              </Alert>
            ) : null}

            <Box>
              <Typography
                sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurface, mb: 1 }}
              >
                Corporate Email
              </Typography>
              <TextField
                fullWidth
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="name@company.com"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                      <SymbolIcon size={20} color={palette.outline}>
                        mail
                      </SymbolIcon>
                    </Box>
                  ),
                }}
                inputProps={{ 'aria-label': 'Corporate Email' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    bgcolor: palette.surfaceContainerLowest,
                    color: palette.onSurface,
                    '& fieldset': { borderColor: palette.surfaceVariant },
                    '&:hover fieldset': { borderColor: palette.primaryContainer },
                    '&.Mui-focused fieldset': { borderColor: palette.primaryContainer },
                  },
                }}
              />
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurface }}>
                  Password
                </Typography>
                <MuiLink
                  href="#"
                  underline="hover"
                  sx={{
                    fontSize: 13,
                    lineHeight: '18px',
                    color: palette.primaryContainer,
                  }}
                >
                  Forgot password?
                </MuiLink>
              </Box>
              <TextField
                fullWidth
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                      <SymbolIcon size={20} color={palette.outline}>
                        lock
                      </SymbolIcon>
                    </Box>
                  ),
                }}
                inputProps={{ 'aria-label': 'Password' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    bgcolor: palette.surfaceContainerLowest,
                    color: palette.onSurface,
                    '& fieldset': { borderColor: palette.surfaceVariant },
                    '&:hover fieldset': { borderColor: palette.primaryContainer },
                    '&.Mui-focused fieldset': { borderColor: palette.primaryContainer },
                  },
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  sx={{
                    color: palette.surfaceVariant,
                    '&.Mui-checked': { color: palette.primaryContainer },
                  }}
                />
              }
              label={
                <Typography
                  sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
                >
                  Remember me on this device
                </Typography>
              }
            />

            <Box sx={{ pt: 1 }}>
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                variant="contained"
                endIcon={<SymbolIcon size={18}>{'arrow_forward'}</SymbolIcon>}
                sx={{
                  minHeight: 48,
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 500,
                  color: palette.onPrimary,
                  bgcolor: palette.primaryContainer,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                  '&:hover': { bgcolor: '#0c3d67' },
                }}
              >
                {isLoading ? 'Signing In' : 'Sign In'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 10, textAlign: { xs: 'center', lg: 'left' } }}>
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.outline }}>
              Protected by enterprise-grade security. By logging in, you agree to our{' '}
              <MuiLink href="#" underline="hover" sx={{ color: palette.primaryContainer }}>
                Terms of Service
              </MuiLink>
              .
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '60%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: 'rgba(188, 199, 222, 0.2)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to top right, rgba(247, 249, 251, 0.9), rgba(247, 249, 251, 0.5), transparent), url(${HERO_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(0.9)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 560,
            mx: 4,
            p: 4,
            borderRadius: '4px',
            bgcolor: 'rgba(247, 249, 251, 0.8)',
            backdropFilter: 'blur(12px)',
            border: `1px solid rgba(194, 199, 209, 0.2)`,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
            <SymbolIcon size={32} color={palette.primary}>
              security
            </SymbolIcon>
            <Box>
              <Typography
                sx={{
                  fontSize: 20,
                  lineHeight: '28px',
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  color: palette.onSurface,
                  mb: 1,
                }}
              >
                Secure Operations Portal
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: '20px',
                  color: palette.onSurfaceVariant,
                }}
              >
                Access restricted to authorized personnel. All data transactions are monitored and
                encrypted to ensure enterprise-grade security compliance.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: `1px solid rgba(194, 199, 209, 0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '999px',
                  bgcolor: palette.error,
                  animation: 'pulse 1.8s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.35 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Typography
                sx={{ fontSize: 14, lineHeight: '20px', color: palette.onSurfaceVariant }}
              >
                System Status: Active
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, lineHeight: '16px', color: palette.outline }}>
              v.4.2.1-b
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
