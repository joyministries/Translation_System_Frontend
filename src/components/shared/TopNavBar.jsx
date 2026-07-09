import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth_store';
import { authAPI } from '../../api/auth';
import { useDarkMode } from '../../hooks/useDarkMode';
import toast from 'react-hot-toast';
import logo from '../../assets/team_impact_logo.png';

const TABS = {
  admin: [
    { label: 'Books', path: '/admin/books' },
    { label: 'Exams', path: '/admin/exams' },
  ],
  student: [
    { label: 'Books', path: '/student/browse' },
    { label: 'Exams', path: '/student/browse-exams' },
  ],
};

const isTabActive = (tab, pathname) => {
  if (tab.path === '/admin/books')        return pathname.startsWith('/admin/books')  || pathname.startsWith('/admin/book/');
  if (tab.path === '/admin/exams')        return pathname.startsWith('/admin/exams')  || pathname.startsWith('/admin/exam/');
  if (tab.path === '/student/browse')     return (pathname.startsWith('/student/browse') && !pathname.startsWith('/student/browse-exams')) || pathname.startsWith('/student/book/');
  if (tab.path === '/student/browse-exams') return pathname.startsWith('/student/browse-exams') || pathname.startsWith('/student/exam/');
  return false;
};

// ── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TopNavBar({ role }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  const [profileForm,    setProfileForm]    = useState({ full_name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const tabs = TABS[role] || [];

  // Pre-fill form when edit panel opens
  useEffect(() => {
    if (profileOpen) {
      setProfileForm({ full_name: user?.full_name || '', email: user?.email || '' });
    }
  }, [profileOpen, user]);

  // Close on outside click or Escape
  useEffect(() => {
    const onOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setProfileOpen(false);
      }
    };
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
    } catch (_) {
      // Backend unavailable — clear client session regardless
    } finally {
      logout();
      setIsLoggingOut(false);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const payload = {
        full_name: profileForm.full_name.trim(),
        email:     profileForm.email.trim(),
      };
      await authAPI.updateProfile(payload);
      toast.success('Profile updated successfully.');
      setProfileOpen(false);
      setDropdownOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const displayName = user?.full_name || user?.email || 'User';
  const initials    = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottomColor: 'var(--border-default)' }} className="border-b shadow-sm sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── LEFT: Brand ── */}
            <div className="flex items-center gap-3 shrink-0">
              <img src={logo} alt="Team Impact Logo" className="h-10 w-auto object-contain" />
              <div className="leading-tight">
                <p style={{ color: 'var(--text-primary)' }} className="text-sm font-bold whitespace-nowrap">
                  Team Impact Christian University
                </p>
                <p style={{ color: 'var(--text-muted)' }} className="text-xs whitespace-nowrap">
                  Education Content Translation Platform
                </p>
              </div>
            </div>

            {/* ── CENTER: Tabs (desktop) ── */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
              {tabs.map((tab) => {
                const active = isTabActive(tab, location.pathname);
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`px-5 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* ── RIGHT: Dark-mode toggle + Dropdown + Mobile hamburger ── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Dark / Light pill toggle */}
              <button
                onClick={toggleDark}
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ backgroundColor: isDark ? 'var(--brand-600)' : 'var(--bg-subtle)' }}
                className="relative flex items-center w-14 h-7 rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 shrink-0"
              >
                {/* Sliding circle */}
                <span
                  style={{ transform: isDark ? 'translateX(28px)' : 'translateX(0px)' }}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow transition-transform duration-300"
                >
                  {isDark ? (
                    <MoonIcon />
                  ) : (
                    <SunIcon />
                  )}
                </span>
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-menu-button"
                  onClick={() => { setDropdownOpen((o) => !o); setProfileOpen(false); }}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-controls="user-menu"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 hover:opacity-80"
                >
                  <span style={{ backgroundColor: 'var(--brand-600)', color: '#ffffff' }} className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center select-none">
                    {initials}
                  </span>
                  <span className="hidden sm:block text-sm font-medium max-w-[140px] truncate">{displayName}</span>
                  <ChevronIcon open={dropdownOpen} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    id="user-menu"
                    role="menu"
                    aria-labelledby="user-menu-button"
                    style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                    className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl border py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {/* User info header with pencil edit trigger */}
                    <div style={{ borderBottomColor: '#f1f5f9' }} className="px-4 py-3 border-b">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-800">
                            {displayName}
                          </p>
                          {user?.full_name && (
                            <p className="text-xs truncate text-slate-500">{user.email}</p>
                          )}
                          <p className="text-xs capitalize text-slate-400">{user?.role}</p>
                        </div>
                        {/* Pencil icon — opens/closes the edit form */}
                        <button
                          onClick={() => setProfileOpen((o) => !o)}
                          aria-label={profileOpen ? 'Close profile editor' : 'Edit profile'}
                          aria-expanded={profileOpen}
                          className={`p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 shrink-0 ${
                            profileOpen
                              ? 'bg-brand-100 text-brand-600'
                              : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
                          }`}
                        >
                          <PencilIcon />
                        </button>
                      </div>

                      {/* Inline Profile Edit Form */}
                      {profileOpen && (
                        <form onSubmit={handleProfileSave} className="mt-3 space-y-3">
                          <div>
                            <label htmlFor="profile-name" className="block text-xs font-medium text-slate-500 mb-1">
                              Full Name
                            </label>
                            <input
                              id="profile-name"
                              type="text"
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                              placeholder="Your full name"
                              style={{ backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#cbd5e1' }}
                              className="w-full px-3 py-2 text-sm rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>
                          <div>
                            <label htmlFor="profile-email" className="block text-xs font-medium text-slate-500 mb-1">
                              Email
                            </label>
                            <input
                              id="profile-email"
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                              placeholder="your@email.com"
                              autoComplete="email"
                              style={{ backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#cbd5e1' }}
                              className="w-full px-3 py-2 text-sm rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={profileLoading}
                              className="flex-1 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                            >
                              {profileLoading ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfileOpen(false)}
                              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Logout */}
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 group"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-slate-100 dark:border-slate-700 py-2 flex gap-1" aria-label="Mobile navigation">
              {tabs.map((tab) => {
                const active = isTabActive(tab, location.pathname);
                return (
                  <button
                    key={tab.path}
                    onClick={() => { navigate(tab.path); setMobileMenuOpen(false); }}
                    aria-current={active ? 'page' : undefined}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Blurred Loading Overlay during Logout */}
      {isLoggingOut && (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-slate-950/60' : 'bg-white/60'}`}>
          <div
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            className="p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <div style={{ borderColor: 'var(--border-default)' }} className="absolute inset-0 rounded-full border-4"></div>
              {/* Spinning brand color ring */}
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold mt-2">Logging Out</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm text-center">
              Clearing session data and securing your connection...
            </p>
          </div>
        </div>
      )}
    </>
  );
}


