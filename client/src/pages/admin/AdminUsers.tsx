import { useEffect, useRef, useState, useMemo } from 'react';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { ChangeRoleModal } from '../../components/admin/ChangeRoleModal';
import { DeleteUserModal } from '../../components/admin/DeleteUserModal';
import { CreateUserModal } from '../../components/admin/CreateUserModal';
import { findAllUsers, type UserSummary } from '../../api/users';

type RoleFilter = 'ALL' | 'ADMIN' | 'USER';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
};

// Derives up to 2 uppercase initials from a name or falls back to the email
function getInitials(fullName: string | null, email: string): string {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function AdminUsers() {
  // useState holds the fetched user list, loading flag, and any error message
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // roleTarget is the user whose role is being changed; null means modal closed
  const [roleTarget, setRoleTarget] = useState<UserSummary | null>(null);
  // deleteTarget is the user being deleted; null means modal closed
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Search / filter / sort state
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<RoleFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Refs for click-outside-to-close
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // useEffect runs once on mount to load users from the API
  useEffect(() => {
    findAllUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  // useMemo derives the visible list from the full list + current search/filter/sort
  // This avoids re-running the logic on every render unless its inputs change
  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...users]
      .filter((u) => {
        if (filterRole !== 'ALL' && u.role !== filterRole) return false;
        if (q) {
          const name = (u.fullName ?? '').toLowerCase();
          const email = u.email.toLowerCase();
          return name.includes(q) || email.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email);
          case 'name-desc':
            return (b.fullName ?? b.email).localeCompare(a.fullName ?? a.email);
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [users, search, filterRole, sortBy]);

  function handleRoleUpdated(updated: UserSummary) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleDeleted(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  function handleCreated(user: UserSummary) {
    setUsers((prev) => [user, ...prev]);
  }

  return (
    <>
      <CreateUserModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <ChangeRoleModal
        isOpen={roleTarget !== null}
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onUpdated={handleRoleUpdated}
      />
      <DeleteUserModal
        isOpen={deleteTarget !== null}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-headline-sm font-headline font-bold text-on-surface">Users</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Manage system access and roles.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCreateOpen(true)}
                className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Create User
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex-1 max-w-md relative flex items-center bg-surface px-3 py-2 rounded-lg">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-body text-on-surface placeholder-on-surface-variant p-0"
                placeholder="Search users by name or email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="ml-1 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-2">
              {/* Filter dropdown */}
              <div ref={filterRef} className="relative">
                <button
                  onClick={() => { setFilterOpen((o) => !o); setSortOpen(false); }}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    filterRole !== 'ALL'
                      ? 'text-primary bg-primary-container/30 font-medium'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  {filterRole === 'ALL' ? 'Filter' : filterRole}
                  <span className="material-symbols-outlined text-[16px]">
                    {filterOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                    {(['ALL', 'ADMIN', 'USER'] as RoleFilter[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => { setFilterRole(option); setFilterOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                          filterRole === option
                            ? 'text-primary bg-primary-container/20 font-medium'
                            : 'text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <span>{option === 'ALL' ? 'All roles' : option === 'ADMIN' ? 'Admin' : 'User'}</span>
                        {filterRole === option && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>

              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    sortBy !== 'newest'
                      ? 'text-primary bg-primary-container/30 font-medium'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">sort</span>
                  {sortBy !== 'newest' ? SORT_LABELS[sortBy] : 'Sort'}
                  <span className="material-symbols-outlined text-[16px]">
                    {sortOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                    {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([option, label]) => (
                      <button
                        key={option}
                        onClick={() => { setSortBy(option); setSortOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                          sortBy === option
                            ? 'text-primary bg-primary-container/20 font-medium'
                            : 'text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <span>{label}</span>
                        {sortBy === option && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container/20 px-4 py-3 rounded-lg">{error}</p>
          )}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-low bg-surface/50">
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!loading && visibleUsers.length === 0 && !error && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                      {users.length === 0 ? 'No users found.' : 'No users match your search or filter.'}
                    </td>
                  </tr>
                )}
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group border-b border-surface-container-low/50 last:border-0 transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                          {getInitials(user.fullName, user.email)}
                        </div>
                        <span className="font-medium text-on-surface">
                          {user.fullName || <span className="text-on-surface-variant italic">No name</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-tertiary-container text-on-tertiary-container text-xs font-medium">
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-xs font-medium">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors"
                          title="Change Role"
                          onClick={() => setRoleTarget(user)}
                        >
                          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                        </button>
                        <button
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
