import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AlertsBell from './AlertsBell';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '▣' },
  { name: 'Queue', path: '/queue', icon: '⟳' },
  { name: 'Audit', path: '/audit', icon: '≡' },
  { name: 'Policies', path: '/policies', icon: '⬡' },
  { name: 'Analytics', path: '/analytics', icon: '↗' },
];

const moreLinks = [
  { name: 'Evaluation', path: '/evaluation', emoji: '🎯' },
  { name: 'Merchants', path: '/merchants', emoji: '🏪' },
  { name: 'Webhooks', path: '/webhook-logs', emoji: '🔗' },
  { name: 'Notifications', path: '/notifications', emoji: '🔔' },
  { name: 'Profile', path: '/profile', emoji: '👤' },
  { name: 'Settings', path: '/settings', emoji: '⚙️' },
];

export default function Navbar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setIsMobileOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreLinks.some(l => l.path === location.pathname);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#0252ea] flex items-center justify-center shadow-md group-hover:shadow-rzp transition-shadow duration-200">
              <span className="text-white text-base font-black leading-none">R</span>
            </div>
            <span className="text-[17px] font-bold text-slate-900 dark:text-white hidden sm:block tracking-tight">
              Recover<span className="text-[#0252ea]">IQ</span>
            </span>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────── */}
          {token && (
            <div className="hidden lg:flex items-center gap-0.5 flex-1 ml-6">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive(link.path)
                      ? 'bg-[#eef3fe] dark:bg-[#0252ea]/15 text-[#0252ea] dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#0252ea] dark:hover:text-blue-400 hover:bg-[#eef3fe]/60 dark:hover:bg-[#0252ea]/10'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1 ${
                    isMoreActive
                      ? 'bg-[#eef3fe] dark:bg-[#0252ea]/15 text-[#0252ea] dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#0252ea] dark:hover:text-blue-400 hover:bg-[#eef3fe]/60 dark:hover:bg-[#0252ea]/10'
                  }`}
                >
                  More
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-slide-down">
                    {moreLinks.map(link => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive(link.path)
                            ? 'text-[#0252ea] dark:text-blue-400 bg-[#eef3fe] dark:bg-[#0252ea]/10'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{link.emoji}</span>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Right Actions ──────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
            {token && <AlertsBell />}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
              aria-label="Toggle dark mode"
              title={dark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {dark ? (
                <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Auth button */}
            <div className="hidden sm:block">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            {token && (
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────── */}
        {isMobileOpen && token && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-slide-down">
            <div className="grid grid-cols-2 gap-1 py-2">
              {[...navLinks, ...moreLinks].map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#eef3fe] dark:bg-[#0252ea]/15 text-[#0252ea] dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {'emoji' in link ? <span>{(link as any).emoji}</span> : null}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
