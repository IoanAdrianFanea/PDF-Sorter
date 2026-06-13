import { useState, useEffect, useCallback } from 'react';
import { AdminTabs } from '../../components/admin/AdminTabs';
import {
  getPendingUsers,
  getRejectedUsers,
  updateUserAccountStatus,
  deleteUser,
  type UserWithStatus,
} from '../../api/users';

// --- Confirmation modal (inline, no separate file needed) ---

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: 'danger' | 'primary';
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmStyle,
  isLoading,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  const btnClass =
    confirmStyle === 'danger'
      ? 'bg-error text-on-error hover:bg-error/90'
      : 'bg-primary text-on-primary hover:bg-primary/90';

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdrop}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm mx-4">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
          <p className="text-body-sm text-on-surface-variant mt-2">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

function getInitials(user: UserWithStatus): string {
  const name = user.fullName?.trim();
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const avatarColors = [
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary-fixed-dim text-on-primary-fixed',
  'bg-error-container text-on-error-container',
];

function avatarColor(id: string) {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[sum % avatarColors.length];
}

// --- Main page ---

type Tab = 'pending' | 'rejected';

interface PendingAction {
  userId: string;
  type: 'reject' | 'delete' | 'approve-rejected';
}

export default function AdminPending() {
  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<UserWithStatus[]>([]);
  const [rejected, setRejected] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // userId being actioned
  const [confirm, setConfirm] = useState<PendingAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [p, r] = await Promise.all([getPendingUsers(), getRejectedUsers()]);
      setPending(p);
      setRejected(r);
    } catch {
      setError('Failed to load users. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Approve a pending user immediately (no confirm needed)
  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await updateUserAccountStatus(userId, 'ACTIVE');
      setPending((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      setError('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Open confirmation for reject / delete / re-approve-from-rejected
  const openConfirm = (action: PendingAction) => setConfirm(action);
  const closeConfirm = () => { if (!confirmLoading) setConfirm(null); };

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.type === 'reject') {
        const updated = await updateUserAccountStatus(confirm.userId, 'REJECTED');
        setPending((prev) => prev.filter((u) => u.id !== confirm.userId));
        setRejected((prev) => [...prev, updated]);
      } else if (confirm.type === 'delete') {
        await deleteUser(confirm.userId);
        setRejected((prev) => prev.filter((u) => u.id !== confirm.userId));
      } else if (confirm.type === 'approve-rejected') {
        await updateUserAccountStatus(confirm.userId, 'ACTIVE');
        setRejected((prev) => prev.filter((u) => u.id !== confirm.userId));
      }
      setConfirm(null);
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Build confirm modal props based on action type
  const confirmProps = (() => {
    if (!confirm) return null;
    if (confirm.type === 'reject') {
      const user = pending.find((u) => u.id === confirm.userId);
      const name = user?.fullName?.trim() || user?.email || 'this user';
      return {
        title: 'Reject registration',
        message: `Are you sure you want to reject ${name}'s access request? They will not be able to log in.`,
        confirmLabel: 'Reject',
        confirmStyle: 'danger' as const,
      };
    }
    if (confirm.type === 'delete') {
      const user = rejected.find((u) => u.id === confirm.userId);
      const name = user?.fullName?.trim() || user?.email || 'this user';
      return {
        title: 'Delete account',
        message: `This will permanently delete ${name}'s account. This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmStyle: 'danger' as const,
      };
    }
    // approve-rejected
    const user = rejected.find((u) => u.id === confirm.userId);
    const name = user?.fullName?.trim() || user?.email || 'this user';
    return {
      title: 'Approve account',
      message: `Approve ${name}'s account? They will be able to log in immediately.`,
      confirmLabel: 'Approve',
      confirmStyle: 'primary' as const,
    };
  })();

  const displayList = tab === 'pending' ? pending : rejected;

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">

          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-headline-sm font-headline font-bold text-on-surface">Pending Approvals</h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Review new user access requests and manage rejected accounts.
              </p>
            </div>
          </header>

          {/* Sub-tabs */}
          <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab('pending')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'pending'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Pending
              {pending.length > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-primary text-on-primary rounded-full px-1.5 py-0.5">
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('rejected')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'rejected'
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Rejected
              {rejected.length > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-surface-container-high text-on-surface-variant rounded-full px-1.5 py-0.5">
                  {rejected.length}
                </span>
              )}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-xl bg-error-container/30 border border-error/20 px-5 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high" />
                    <div className="w-20 h-5 rounded-md bg-surface-container-high" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="w-32 h-4 rounded bg-surface-container-high" />
                    <div className="w-48 h-3 rounded bg-surface-container-high" />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-surface-container-high/50">
                    <div className="flex-1 h-9 rounded-lg bg-surface-container-high" />
                    <div className="flex-1 h-9 rounded-lg bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && displayList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">
                {tab === 'pending' ? 'pending_actions' : 'person_off'}
              </span>
              <p className="text-body-md font-semibold text-on-surface-variant">
                {tab === 'pending' ? 'No pending requests' : 'No rejected accounts'}
              </p>
              <p className="text-body-sm text-on-surface-variant/70 mt-1">
                {tab === 'pending'
                  ? 'All access requests have been reviewed.'
                  : 'No accounts have been rejected yet.'}
              </p>
            </div>
          )}

          {/* User cards */}
          {!isLoading && displayList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayList.map((user) => {
                const isActioning = actionLoading === user.id;
                const initials = getInitials(user);
                const color = avatarColor(user.id);
                const displayName = user.fullName?.trim() || user.email;

                return (
                  <div
                    key={user.id}
                    className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex flex-col group hover:bg-surface-container-low transition-colors duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-lg ${color}`}>
                        {initials}
                      </div>
                      <span className="text-[10px] font-label font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                        {timeAgo(user.createdAt)}
                      </span>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-body-md font-bold text-on-surface">{displayName}</h3>
                      <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
                    </div>

                    {/* Pending tab actions */}
                    {tab === 'pending' && (
                      <div className="mt-auto flex gap-3 pt-4 border-t border-surface-container-high/50">
                        <button
                          disabled={isActioning}
                          onClick={() => openConfirm({ userId: user.id, type: 'reject' })}
                          className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-error font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">close</span> Reject
                        </button>
                        <button
                          disabled={isActioning}
                          onClick={() => handleApprove(user.id)}
                          className="flex-1 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1 disabled:opacity-50"
                        >
                          {isActioning ? (
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">check</span>
                          )}
                          Approve
                        </button>
                      </div>
                    )}

                    {/* Rejected tab actions */}
                    {tab === 'rejected' && (
                      <div className="mt-auto flex gap-3 pt-4 border-t border-surface-container-high/50">
                        <button
                          onClick={() => openConfirm({ userId: user.id, type: 'delete' })}
                          className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-error font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span> Delete
                        </button>
                        <button
                          onClick={() => openConfirm({ userId: user.id, type: 'approve-rejected' })}
                          className="flex-1 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">check</span> Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm && confirmProps && (
        <ConfirmModal
          isOpen
          title={confirmProps.title}
          message={confirmProps.message}
          confirmLabel={confirmProps.confirmLabel}
          confirmStyle={confirmProps.confirmStyle}
          isLoading={confirmLoading}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      )}
    </main>
  );
}
