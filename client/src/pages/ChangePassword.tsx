import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';

const PASSWORD_RULES = [
  { label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()\-_=+\[\]{};':",.<>?/\\|`~]/.test(p) },
];

/**
 * Force-change-password page.
 * Shown immediately after login when mustChangePassword is true.
 * The user must provide their current (temporary) password and a new strong password.
 */
export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const allRulesMet = PASSWORD_RULES.every((r) => r.test(newPassword));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNewPasswordTouched(true);

    if (!allRulesMet) {
      setError('Please meet all password requirements below.');
      return;
    }

    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(accessToken, currentPassword, newPassword);
      // Password changed — send user to the app
      navigate('/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
      <header className="w-full flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">DocIndex</h2>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#15202b] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 mb-4">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
              Set a new password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your account requires a new password before you can continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="currentPassword">
                Current (temporary) password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3 transition-colors placeholder:text-slate-400"
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3 transition-colors placeholder:text-slate-400"
                placeholder="Create a strong password"
              />
              <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {passed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center items-center rounded-lg bg-primary mt-2 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
