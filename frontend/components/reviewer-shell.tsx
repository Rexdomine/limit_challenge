'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { Box, Button, Drawer, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth';

const palette = {
  background: '#f7f9fb',
  surface: '#ffffff',
  surfaceLow: '#f2f4f6',
  outline: '#727780',
  outlineVariant: '#c2c7d1',
  primary: '#00355f',
  primaryContainer: '#0f4c81',
  onSurface: '#191c1e',
  onSurfaceVariant: '#42474f',
};

const navigationItems = [
  { label: 'Dashboard', icon: 'dashboard', href: undefined },
  { label: 'Submissions', icon: 'list_alt', href: '/submissions' },
  { label: 'Queue', icon: 'hourglass_empty', href: undefined },
  { label: 'Reports', icon: 'analytics', href: undefined },
  { label: 'Settings', icon: 'settings', href: undefined },
];

function SymbolIcon({
  children,
  fill = false,
  size = 20,
}: {
  children: string;
  fill?: boolean;
  size?: number;
}) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {children}
    </Box>
  );
}

function NavItem({
  label,
  icon,
  href,
  active,
}: {
  label: string;
  icon: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        mx: active ? 0 : 1,
        ml: active ? 1 : 1,
        mr: active ? 0 : 1,
        borderRight: active ? `4px solid ${palette.primaryContainer}` : '4px solid transparent',
        borderRadius: active ? '6px 0 0 6px' : '4px',
        bgcolor: active ? palette.surface : 'transparent',
        color: active ? palette.primaryContainer : palette.onSurfaceVariant,
        transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
        '&:hover': href
          ? {
              bgcolor: palette.surfaceLow,
              color: palette.primaryContainer,
            }
          : undefined,
      }}
    >
      <SymbolIcon fill={active}>{icon}</SymbolIcon>
      <Typography
        sx={{
          fontSize: 12,
          lineHeight: '16px',
          letterSpacing: '0.05em',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  if (!href) {
    return (
      <Box component="li" sx={{ listStyle: 'none', opacity: 0.72 }}>
        {content}
      </Box>
    );
  }

  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      <Box component={Link} href={href} sx={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </Box>
    </Box>
  );
}

export default function ReviewerShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const isSubmissionsRoute = pathname?.startsWith('/submissions');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.background }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: palette.surface,
            borderRight: `1px solid ${palette.outlineVariant}`,
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            py: 3,
          }}
        >
          <Box sx={{ px: 3, mb: 4 }}>
            <Typography
              component={Link}
              href="/submissions"
              sx={{
                textDecoration: 'none',
                display: 'block',
                fontSize: 20,
                lineHeight: '28px',
                letterSpacing: '-0.01em',
                fontWeight: 900,
                color: palette.primary,
              }}
            >
              Submission Tracker
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, lineHeight: '18px', color: palette.outline }}>
              Ops Management v2.4
            </Typography>
          </Box>

          <Box component="nav" sx={{ flex: 1 }}>
            <Box component="ul" sx={{ m: 0, p: 0 }}>
              {navigationItems.map((item) => (
                <NavItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  href={item.href}
                  active={Boolean(item.href && isSubmissionsRoute && item.href === '/submissions')}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 2, mt: 'auto' }}>
            <Box sx={{ borderTop: `1px solid ${palette.outlineVariant}`, pt: 2, mb: 2 }}>
              <NavItem label="Support" icon="support_agent" />
            </Box>
            <Stack spacing={1.5} sx={{ px: 2 }}>
              <Typography
                sx={{ fontSize: 13, lineHeight: '18px', color: palette.onSurfaceVariant }}
              >
                Signed in as {user?.displayName ?? 'Reviewer'}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleLogout}
                startIcon={<SymbolIcon>logout</SymbolIcon>}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: palette.outlineVariant,
                  color: palette.onSurfaceVariant,
                  textTransform: 'none',
                  fontSize: 14,
                  '&:hover': {
                    borderColor: palette.primaryContainer,
                    color: palette.primaryContainer,
                    bgcolor: palette.surfaceLow,
                  },
                }}
              >
                Sign Out
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          borderBottom: `1px solid ${palette.outlineVariant}`,
          bgcolor: palette.surface,
        }}
      >
        <Toolbar sx={{ minHeight: 72, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography
              component={Link}
              href="/submissions"
              sx={{
                textDecoration: 'none',
                color: palette.primary,
                fontSize: 20,
                lineHeight: '28px',
                fontWeight: 800,
              }}
            >
              Submission Tracker
            </Typography>
            <Typography sx={{ fontSize: 13, lineHeight: '18px', color: palette.outline }}>
              Reviewer workspace
            </Typography>
          </Box>
          <IconButton
            onClick={handleLogout}
            aria-label="Sign out"
            sx={{ color: palette.onSurfaceVariant }}
          >
            <SymbolIcon>logout</SymbolIcon>
          </IconButton>
        </Toolbar>
      </Box>

      <Box component="main" sx={{ minHeight: '100vh', ml: { md: '240px' } }}>
        {children}
      </Box>
    </Box>
  );
}
