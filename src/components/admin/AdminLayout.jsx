import { Outlet } from 'react-router-dom';
import { TopNavBar } from '../shared/TopNavBar';

export function AdminLayout() {
  return (
    <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }} className="min-h-screen transition-colors duration-200">
      <TopNavBar role="admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
