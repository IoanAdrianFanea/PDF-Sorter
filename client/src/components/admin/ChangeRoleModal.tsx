import { useEffect, useState } from 'react';
import { setUserRole, type UserSummary } from '../../api/users';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: UserSummary | null;
  onClose: () => void;
  onUpdated: (updated: UserSummary) => void;
}

export function ChangeRoleModal({ isOpen, user, onClose, onUpdated }: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN'>(user?.role ?? 'USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset selection whenever the modal opens for a (potentially different) user
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
      setError('');
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const hasChanged = selectedRole !== user.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanged) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const updated = await setUserRole(user.id, selectedRole);
      onUpdated(updated);
      onClose();
    } catch {
      setError('Failed to update role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  const displayName = user.fullName?.trim() || user.email;

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface">Change Role</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <p className="text-body-sm text-on-surface-variant mb-5">
            Select a new role for <span className="font-medium text-on-surface">{displayName}</span>.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {/* USER option */}
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedRole === 'USER'
                  ? 'border-primary bg-primary-container/20'
                  : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="USER"
                checked={selectedRole === 'USER'}
                onChange={() => setSelectedRole('USER')}
                disabled={isSubmitting}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-label-md font-semibold text-on-surface">User</p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Can upload, search, and manage their own documents.
                </p>
              </div>
            </label>

            {/* ADMIN option */}
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedRole === 'ADMIN'
                  ? 'border-primary bg-primary-container/20'
                  : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={selectedRole === 'ADMIN'}
                onChange={() => setSelectedRole('ADMIN')}
                disabled={isSubmitting}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-label-md font-semibold text-on-surface">Admin</p>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Full access to all documents, users, and system settings.
                </p>
              </div>
            </label>
          </div>

          {error && (
            <p className="mb-4 text-label-sm text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanged}
              className="px-4 py-2 rounded-lg text-label-md font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              Save Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
