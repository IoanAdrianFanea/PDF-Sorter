import { useEffect, useRef, useState } from 'react';
import { adminEditUser, type UserSummary } from '../../api/users';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserSummary | null;
  onClose: () => void;
  onUpdated: (updated: UserSummary) => void;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
}

export function EditUserModal({ isOpen, user, onClose, onUpdated }: EditUserModalProps) {
  const [form, setForm] = useState<FormState>({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Populate form when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setForm({ fullName: user.fullName ?? '', email: user.email, password: '' });
      setError('');
      setShowPassword(false);
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) { setError('Email is required.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const payload: { fullName?: string; email?: string; password?: string } = {};
      if (trimmedName !== (user.fullName ?? '')) payload.fullName = trimmedName;
      if (trimmedEmail !== user.email) payload.email = trimmedEmail;
      if (form.password) payload.password = form.password;

      const updated = await adminEditUser(user.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </div>
            <div>
              <h2 className="text-title-md font-semibold text-on-surface">Edit User</h2>
              <p className="text-label-sm text-on-surface-variant">{user.email}</p>
            </div>
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
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Full Name</label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              required
              onChange={(e) => set('email', e.target.value)}
              className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              placeholder="user@company.com"
            />
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">
              New Temporary Password
              <span className="ml-1 text-on-surface-variant/60 font-normal">(optional — user must change on login)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 pr-10 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                placeholder="Leave blank to keep unchanged"
                minLength={form.password ? 8 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-label-xs text-on-surface-variant/60 mt-1">Minimum 8 characters. The user will be required to set a stronger password on next login.</p>
          </div>

          {error && (
            <p className="text-label-sm text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
