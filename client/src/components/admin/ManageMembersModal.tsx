import { useEffect, useRef, useState } from 'react';
import { getProjectMembers, addProjectMember, type ProjectMember } from '../../api/projects';
import { searchUsers, type UserSummary } from '../../api/users';

interface ManageMembersModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onMembersUpdated: (projectId: string, addedCount: number) => void;
}

// Derive initials from full name or email
function getInitials(fullName: string | null, email: string): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function ManageMembersModal({
  isOpen,
  projectId,
  projectName,
  onClose,
  onMembersUpdated,
}: ManageMembersModalProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  // Map of userId -> UserSummary for staged additions (persists across searches)
  const [stagedMap, setStagedMap] = useState<Map<string, UserSummary>>(new Map());
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [currentMembers, setCurrentMembers] = useState<ProjectMember[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Load current members + initial user list when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStagedMap(new Map());
    setSearch('');
    setError('');
    setIsLoading(true);
    Promise.all([getProjectMembers(projectId), searchUsers('')])
      .then(([members, allUsers]) => {
        setCurrentMembers(members);
        setMemberIds(new Set(members.map((m) => m.user.id)));
        setUsers(allUsers);
      })
      .catch(() => setError('Failed to load data. Please try again.'))
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => searchRef.current?.focus(), 0);
      });
  }, [isOpen, projectId]);

  // Debounced search: re-fetches users 300ms after search text changes
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchUsers(search)
        .then(setUsers)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  if (!isOpen) return null;

  const toggleStage = (user: UserSummary) => {
    setStagedMap((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  };

  const unstage = (userId: string) => {
    setStagedMap((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleSubmit = async () => {
    const toAdd = [...stagedMap.keys()];
    if (toAdd.length === 0) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await Promise.all(toAdd.map((userId) => addProjectMember(projectId, userId)));
      onMembersUpdated(projectId, toAdd.length);
      onClose();
    } catch {
      setError('Failed to add some members. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  const stagedList = [...stagedMap.values()];

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">group_add</span>
            </div>
            <div>
              <h2 className="text-title-md font-semibold text-on-surface">Manage Members</h2>
              <p className="text-label-sm text-on-surface-variant">{projectName}</p>
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
        <div className="flex flex-1 min-h-0 border-t border-outline-variant/10">

          {/* Left panel: searchable user list */}
          <div className="flex-1 flex flex-col min-h-0 px-4 py-4">
            {/* Search bar */}
            <div className="relative mb-3 shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                search
              </span>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant hover:text-on-surface rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
              {isLoading ? (
                <p className="text-body-sm text-on-surface-variant text-center py-8">Loading users…</p>
              ) : users.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant text-center py-8">No users found.</p>
              ) : (
                users.map((user) => {
                  const isMember = memberIds.has(user.id);
                  const isStaged = stagedMap.has(user.id);
                  const initials = getInitials(user.fullName, user.email);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low/50 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-label-sm font-bold shrink-0">
                        {initials}
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-on-surface truncate">
                          {user.fullName || <span className="text-on-surface-variant italic">No name</span>}
                        </p>
                        <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
                      </div>

                      {/* Role badge */}
                      {user.role === 'ADMIN' && (
                        <span className="text-label-xs font-semibold px-2 py-0.5 rounded-full bg-error-container/40 text-error shrink-0">
                          ADMIN
                        </span>
                      )}

                      {/* Action icon */}
                      {isMember ? (
                        <span
                          className="material-symbols-outlined text-[20px] text-primary/60 shrink-0"
                          title="Already a member"
                        >
                          how_to_reg
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleStage(user)}
                          title={isStaged ? 'Remove from selection' : 'Add to project'}
                          className={`shrink-0 p-0.5 rounded transition-colors ${
                            isStaged
                              ? 'text-primary hover:text-primary/70'
                              : 'text-on-surface-variant hover:text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isStaged ? 'person_add' : 'person_add'}
                          </span>
                          {/* filled style via font-variation-settings trick: use filled only when staged */}
                          <style>{isStaged ? '' : ''}</style>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-outline-variant/10 shrink-0" />

          {/* Right panel: staged users + current members */}
          <div className="w-56 flex flex-col min-h-0 px-4 py-4">

            {/* To be added */}
            <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2 shrink-0">
              To be added
              {stagedList.length > 0 && (
                <span className="ml-1.5 text-label-xs font-bold px-1.5 py-0.5 rounded-full bg-primary text-on-primary">
                  {stagedList.length}
                </span>
              )}
            </p>

            <div className="flex-1 overflow-y-auto space-y-1 mb-4">
              {stagedList.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant/60 italic mt-1">
                  Select users from the list.
                </p>
              ) : (
                stagedList.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary-container/20 border border-primary/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {getInitials(user.fullName, user.email)}
                    </div>
                    <span className="flex-1 min-w-0 text-label-sm text-on-surface truncate">
                      {user.fullName || user.email}
                    </span>
                    <button
                      onClick={() => unstage(user.id)}
                      title="Remove"
                      className="shrink-0 text-primary hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Current members (informational) */}
            <div className="shrink-0 border-t border-outline-variant/10 pt-3">
              <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Current members
                <span className="ml-1.5 text-label-xs text-on-surface-variant">
                  ({currentMembers.length})
                </span>
              </p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {currentMembers.length === 0 ? (
                  <p className="text-label-sm text-on-surface-variant/60 italic">None yet.</p>
                ) : (
                  currentMembers.map((m) => (
                    <div key={m.user.id} className="flex items-center gap-2 px-1 py-1">
                      <div className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[9px] font-bold shrink-0">
                        {getInitials(m.user.fullName, m.user.email)}
                      </div>
                      <span className="text-label-sm text-on-surface-variant truncate">
                        {m.user.fullName || m.user.email}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/10 shrink-0">
          {error && (
            <p className="text-label-sm text-error flex items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-on-surface-variant">
              {currentMembers.length} current member{currentMembers.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || stagedList.length === 0}
                className="px-4 py-2 rounded-lg text-label-md font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                )}
                {stagedList.length > 0 ? `Add ${stagedList.length} Member${stagedList.length !== 1 ? 's' : ''}` : 'Add Members'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
