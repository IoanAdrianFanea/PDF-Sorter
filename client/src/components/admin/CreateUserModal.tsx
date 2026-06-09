import { useEffect, useRef, useState } from 'react';
import { createUser, type UserSummary } from '../../api/users';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: UserSummary) => void;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

const empty: FormState = { fullName: '', email: '', password: '', role: 'USER' };

export function CreateUserModal({ isOpen, onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      setError('');
      setShowPassword(false);
      setRoleOpen(false);
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close role dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isOpen) return null;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName) { setError('Full name is required.'); return; }
    if (!trimmedEmail) { setError('Email is required.'); return; }
    if (!form.password) { setError('Password is required.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const user = await createUser({
        fullName: trimmedName,
        email: trimmedEmail,
        password: form.password,
        role: form.role,
      });
      onCreated(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface">Create User</h2>
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
        <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
          <p className="text-body-sm text-on-surface-variant -mt-1">
            The user can log in immediately with these credentials.
          </p>

          {/* Full Name */}
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1.5">
              Full Name
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Jane Doe"
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. jane@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1.5">
              Temporary Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                disabled={isSubmitting}
                placeholder="Set a temporary password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1.5">
              Role
            </label>
            <div ref={roleRef} className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen((o) => !o)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
              >
                <span>{form.role === 'ADMIN' ? 'Admin' : 'User'}</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  {roleOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {roleOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                  {(['USER', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { set('role', r); setRoleOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                        form.role === r
                          ? 'text-primary bg-primary-container/20 font-medium'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{r === 'ADMIN' ? 'Admin' : 'User'}</span>
                      {form.role === r && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-label-sm text-error flex items-center gap-1 -mt-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
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
              className="px-4 py-2 rounded-lg text-label-md font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
