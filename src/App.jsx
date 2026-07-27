import { useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/auth_store';
import { useDarkMode } from './hooks/useDarkMode';
import { getAppTheme } from './theme/theme';
import { Spinner } from './components/shared/Spinner';

function App() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const { isDark } = useDarkMode();

  const theme = useMemo(() => getAppTheme(isDark ? 'dark' : 'light'), [isDark]);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  if (isInitializing) {
    return (
      <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }} className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-default)',
            maxWidth: '420px',
          },
          success: {
            duration: 3500,
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            duration: 6000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
          loading: {
            duration: Infinity,
            iconTheme: { primary: '#3b82f6', secondary: '#fff' },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
