import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Reusable toggle component
function Toggle({ enabled, onToggle, id }: { enabled: boolean; onToggle: () => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="toggle-switch"
      data-enabled={String(enabled)}
    >
      <span className="toggle-dot" />
    </button>
  );
}

// Reusable setting row
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login first'); return; }
    axios
      .get(`${API_URL}/api/users/me/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setSettings(res.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load settings'); setLoading(false); });
  }, []);

  const updateSetting = async (key: string, value: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(key);
    try {
      const updated = { ...settings, [key]: value };
      await axios.put(`${API_URL}/api/users/me/settings`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(updated);
      toast.success('Saved');

      if (key === 'theme') {
        const isDark = value === 'dark';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        window.dispatchEvent(new Event('themeChanged'));
      }
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
        <div className="glass-card p-6 space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-56" />
              </div>
              <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="empty-state mt-8 max-w-md mx-auto">
        <div className="empty-icon">⚙️</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No Settings Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Please log out and log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="page-icon text-lg">⚙️</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
          Manage your account preferences and notification settings.
        </p>
      </div>

      {/* ── Appearance ─────────────────────────────────────── */}
      <div className="glass-card p-6 mb-4">
        <p className="section-header">Appearance</p>
        <SettingRow
          title="Theme"
          description="Switch between light and dark display mode."
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {settings.theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <Toggle
              id="theme-toggle"
              enabled={settings.theme === 'dark'}
              onToggle={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </SettingRow>
        <SettingRow
          title="Default Page"
          description="Which page loads first after you log in."
        >
          <select
            value={settings.default_dashboard}
            onChange={e => updateSetting('default_dashboard', e.target.value)}
            disabled={saving === 'default_dashboard'}
            className="input-field py-2 px-3 text-sm w-44"
          >
            <option value="dashboard">Overview Dashboard</option>
            <option value="queue">Event Queue</option>
            <option value="audit">Audit Log</option>
            <option value="analytics">Analytics</option>
          </select>
        </SettingRow>
      </div>

      {/* ── Notifications ─────────────────────────────────── */}
      <div className="glass-card p-6 mb-4">
        <p className="section-header">Notifications</p>
        <SettingRow
          title="Email Notifications"
          description="Receive email alerts for important recovery events and summaries."
        >
          <Toggle
            id="email-notif-toggle"
            enabled={!!settings.email_notifications}
            onToggle={() => updateSetting('email_notifications', !settings.email_notifications)}
          />
        </SettingRow>
        <SettingRow
          title="Alert Threshold (₹)"
          description="Send an alert when failed payment amounts exceed this value."
        >
          <div className="relative w-36">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500 font-medium">₹</span>
            <input
              type="number"
              value={settings.alert_threshold}
              onChange={e => updateSetting('alert_threshold', parseInt(e.target.value) || 0)}
              className="input-field py-2 pl-7 pr-3 text-sm w-full"
              placeholder="5000"
              min="0"
            />
          </div>
        </SettingRow>
      </div>

      {/* ── Danger zone ────────────────────────────────────── */}
      <div className="glass-card p-6 border border-red-100 dark:border-red-900/30">
        <p className="section-header text-red-400">Danger Zone</p>
        <SettingRow
          title="Sign Out Everywhere"
          description="Immediately invalidates all active sessions for your account."
        >
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="btn-danger py-2 px-4 text-sm"
          >
            Log Out
          </button>
        </SettingRow>
      </div>

      {/* Save indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving…
        </div>
      )}
    </div>
  );
}