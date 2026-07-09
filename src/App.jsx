
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/auth_store';
import { Spinner } from './components/shared/Spinner';

function App() {
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            borderRadius: '10px',
            background: '#ffffff',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
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
    </>
  );
}

export default App;
