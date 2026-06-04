// client/src/pages/Settings.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SettingsIcon, LockIcon } from '../components/Icons';

const Settings = () => {
  const { admin } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'All password fields are required.' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setStatus({ type: 'success', message: response.data.message || 'Password changed successfully.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      const errMsg = err.response?.data?.message || 'Failed to change password. Double check your current password.';
      setStatus({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white font-display">System Settings</h2>
        <p className="text-xs text-gray-400">Configure admin profile credentials and safety parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="glass-panel p-5 rounded-3xl md:col-span-1 space-y-4 h-fit text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-cyan to-blue-600 text-white font-bold text-xl font-display">
            {admin?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white font-display">{admin?.full_name}</h3>
            <p className="text-xs text-gray-400">System Administrator Role</p>
          </div>
          <div className="pt-2 text-left space-y-2 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500">
            <p><b>Username:</b> <span className="font-mono dark:text-gray-300">{admin?.username}</span></p>
            <p><b>Account Created:</b> <span className="dark:text-gray-350">{new Date(admin?.createdAt || Date.now()).toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-3xl md:col-span-2 space-y-5">
          <div className="border-b border-gray-100 dark:border-white/5 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-white font-display">Change Administrative Password</h3>
            <p className="text-[10px] text-gray-400">Ensure security by keeping your access keys updated</p>
          </div>

          {status.message && (
            <div className={`p-3 text-sm border rounded-xl animate-fade-in ${
              status.type === 'success' 
                ? 'text-emerald-600 bg-emerald-50 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                : 'text-red-600 bg-red-50 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition text-sm"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition text-sm"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-accent-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Updating Credentials...' : 'Save Password Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
