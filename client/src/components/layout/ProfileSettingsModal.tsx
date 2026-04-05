import { useState } from 'react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'security';

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const isProfileTab = activeTab === 'profile';

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute right-0 top-0 h-full w-full lg:max-w-[56vw] lg:min-w-[720px] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        <header className="flex items-start justify-between px-7 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-[1.6rem] leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
              {isProfileTab ? 'Account' : 'Account Settings'}
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              {isProfileTab
                ? 'Manage your personal information and security'
                : 'Manage your security preferences and active sessions.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-7 pt-3">
          <nav className="flex w-fit gap-1 p-1 rounded-full bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'px-6 py-1.5 rounded-full bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-300 dark:border-slate-600'
                  : 'px-6 py-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'px-6 py-1.5 rounded-full bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-300 dark:border-slate-600'
                  : 'px-6 py-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar px-7 py-6 bg-slate-50 dark:bg-slate-900">
          {activeTab === 'profile' && (
            <section className="max-w-3xl space-y-7">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Personal Profile</h3>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-5 grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Alexander Morgan"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      defaultValue="a.morgan@docindex.com"
                      disabled
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-4 text-sm text-slate-400 dark:text-slate-500"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">lock</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Managed by your organization administrator.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">System Role</label>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Admin
                  </div>
                </div>
              </div>

              <section className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Language & Region</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Language</label>
                    <select className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm">
                      <option>English (United States)</option>
                      <option>English (United Kingdom)</option>
                      <option>Deutsch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Timezone</label>
                    <select className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm">
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT+00:00) UTC</option>
                      <option>(GMT+01:00) Central Europe</option>
                    </select>
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="max-w-3xl space-y-7">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Change Password</h3>
                <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    defaultValue="........"
                    className="w-full max-w-md h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">New Password</label>
                    <input
                      type="password"
                      defaultValue="........"
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      defaultValue="........"
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 px-4 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-semibold"
                >
                  Update Password
                </button>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-5">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Logged in devices</h4>
                <p className="text-sm text-slate-500">Review the devices where you are currently signed in.</p>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">laptop_mac</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">MacBook Pro</p>
                      <p className="text-xs text-slate-500">London, UK • Current Session</p>
                    </div>
                  </div>
                  <button type="button" className="text-xs font-semibold text-primary hover:text-primary/80">
                    Details
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">smartphone</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">iPhone 14 Pro</p>
                      <p className="text-xs text-slate-500">London, UK • Active 2 hours ago</p>
                    </div>
                  </div>
                  <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-700">
                    Log Out
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-5 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication</h4>
                  <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account by requiring more than just a password.</p>
                  <button type="button" className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1">
                    Enable 2FA
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        {activeTab === 'profile' ? (
          <footer className="px-7 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/60 dark:bg-slate-900">
            <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign out of session
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Discard
              </button>
              <button type="button" className="px-5 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-semibold">
                Save changes
              </button>
            </div>
          </footer>
        ) : (
          <footer className="px-7 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/60 dark:bg-slate-900">
            <div>
              <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
              <p className="text-xs text-slate-500">Permanently delete your account and all associated data.</p>
            </div>
            <button type="button" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
              Delete Account
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
