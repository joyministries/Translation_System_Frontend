
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
