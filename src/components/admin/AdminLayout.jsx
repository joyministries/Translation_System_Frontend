import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        {/* Sidebar content */}
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

