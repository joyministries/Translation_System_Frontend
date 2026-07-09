import { Outlet } from 'react-router-dom';
import { TopNavBar } from '../shared/TopNavBar';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar role="student" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
