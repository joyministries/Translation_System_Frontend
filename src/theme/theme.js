import { createTheme } from '@mui/material/styles';

/**
 * Creates the single canonical MUI theme for the entire application,
 * dynamically configured for light or dark mode based on the user's preference.
 */
export function getAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#1a6fa8', // Steel royal blue brand color
        light: '#60a5fa',
        dark: '#15578a',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc', // var(--bg-base)
        paper: isDark ? '#1e293b' : '#ffffff',   // var(--bg-surface)
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',   // var(--text-primary)
        secondary: isDark ? '#94a3b8' : '#475569', // var(--text-secondary)
      },
      divider: isDark ? '#334155' : '#e2e8f0',     // var(--border-default)
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Prevents MUI dark mode elevation overlays
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
          containedPrimary: {
            backgroundColor: '#1a6fa8',
            color: '#ffffff !important',
            '&:hover': {
              backgroundColor: '#15578a !important',
              color: '#ffffff !important',
            },
          },
          outlined: {
            borderColor: isDark ? '#334155' : '#cbd5e1',
            color: isDark ? '#f1f5f9' : '#0f172a',
            '&:hover': {
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              borderColor: '#1a6fa8',
              color: '#1a6fa8',
            },
          },
          text: {
            color: isDark ? '#94a3b8' : '#475569',
            '&:hover': {
              backgroundColor: isDark ? '#334155' : '#f1f5f9',
              color: isDark ? '#f1f5f9' : '#0f172a',
            },
          },
        },
      },
    },
  });
}
