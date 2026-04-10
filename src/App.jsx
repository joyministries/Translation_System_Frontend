
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/auth_store';

function App() {
  useEffect(() => {
    // Restore auth from localStorage on app startup
    useAuthStore.getState().initializeAuth();
  }, []);

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
