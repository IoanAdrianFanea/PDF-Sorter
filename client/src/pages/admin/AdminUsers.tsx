import { useEffect, useRef, useState, useMemo } from 'react';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { ChangeRoleModal } from '../../components/admin/ChangeRoleModal';
import { DeleteUserModal } from '../../components/admin/DeleteUserModal';
import { CreateUserModal } from '../../components/admin/CreateUserModal';
import { EditUserModal } from '../../components/admin/EditUserModal';
import {
  findAllUsers,
  bulkDeleteUsers,
  type UserSummary,
  type AccountStatus,
} from '../../api/users';

type RoleFilter = 'ALL' | 'ADMIN' | 'USER';
type StatusFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
};

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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const config: Record<AccountStatus, { cls: string; icon: string; label: string }> = {
    ACTIVE: { cls: 'bg-secondary-container text-on-secondary-container', icon: 'check_circle', label: 'Active' },
    PENDING: { cls: 'bg-surface-container-highest text-on-surface-variant', icon: 'pending', label: 'Pending' },
    REJECTED: { cls: 'bg-error-container text-on-error-container', icon: 'cancel', label: 'Rejected' },
  };
  const { cls, icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${cls}`}>
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {label}
    </span>
  );
}

interface BulkConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  isDanger: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function BulkConfirmModal({ title, message, confirmLabel, isDanger, isLoading, onConfirm, onClose }: BulkConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
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
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isDanger ? 'bg-error text-on-error hover:bg-error/90' : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {isLoading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);
  const [editTarget, setEditTarget] = useState<UserSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Toolbar state
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<RoleFilter>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Multi-select state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    findAllUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  // Clear selection when filters/sort change
  useEffect(() => { setSelected(new Set()); }, [search, filterRole, filterStatus, sortBy]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...users]
      .filter((u) => {
        if (filterRole !== 'ALL' && u.role !== filterRole) return false;
        if (filterStatus !== 'ALL' && u.accountStatus !== filterStatus) return false;
        if (q) {
          return (u.fullName ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc': return (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email);
          case 'name-desc': return (b.fullName ?? b.email).localeCompare(a.fullName ?? a.email);
          case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'newest': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [users, search, filterRole, filterStatus, sortBy]);

  // --- Selection helpers ---

  function toggleUser(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    setLastClickedId(userId);
  }

  function rangeSelect(toId: string) {
    if (!lastClickedId) { toggleUser(toId); return; }
    const ids = visibleUsers.map((u) => u.id);
    const a = ids.indexOf(lastClickedId);
    const b = ids.indexOf(toId);
    if (a === -1 || b === -1) { toggleUser(toId); return; }
    const [start, end] = a < b ? [a, b] : [b, a];
    setSelected((prev) => {
      const next = new Set(prev);
      ids.slice(start, end + 1).forEach((id) => next.add(id));
      return next;
    });
  }

  function handleRowClick(userId: string, e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-no-select]')) return;
    if (e.shiftKey && lastClickedId) rangeSelect(userId);
    else toggleUser(userId);
  }

  function handleSelectAll() {
    if (visibleUsers.length > 0 && visibleUsers.every((u) => selected.has(u.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleUsers.map((u) => u.id)));
    }
  }

  // --- Mutations ---

  function handleRoleUpdated(updated: UserSummary) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleUserUpdated(updated: UserSummary) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleDeleted(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setSelected((prev) => { const next = new Set(prev); next.delete(userId); return next; });
  }

  function handleCreated(user: UserSummary) {
    setUsers((prev) => [user, ...prev]);
  }

  async function handleBulkDelete() {
    setBulkLoading(true);
    try {
      const { succeeded, failed } = await bulkDeleteUsers([...selected]);
      setUsers((prev) => prev.filter((u) => !succeeded.includes(u.id)));
      setSelected(new Set());
      if (failed > 0) setError(`${failed} user(s) could not be deleted.`);
      setBulkDeleteOpen(false);
    } finally {
      setBulkLoading(false);
    }
  }

  const allVisibleSelected = visibleUsers.length > 0 && visibleUsers.every((u) => selected.has(u.id));
  const someVisibleSelected = visibleUsers.some((u) => selected.has(u.id));
  const n = selected.size;

  return (
    <>
      <CreateUserModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      <ChangeRoleModal isOpen={roleTarget !== null} user={roleTarget} onClose={() => setRoleTarget(null)} onUpdated={handleRoleUpdated} />
      <DeleteUserModal isOpen={deleteTarget !== null} user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      <EditUserModal isOpen={editTarget !== null} user={editTarget} onClose={() => setEditTarget(null)} onUpdated={handleUserUpdated} />

      {bulkDeleteOpen && (
        <BulkConfirmModal
          title={`Delete ${n} user${n !== 1 ? 's' : ''}?`}
          message={`This will permanently delete ${n} account${n !== 1 ? 's' : ''}. This action cannot be undone.`}
          confirmLabel={`Delete ${n} user${n !== 1 ? 's' : ''}`}
          isDanger
          isLoading={bulkLoading}
          onConfirm={handleBulkDelete}
          onClose={() => { if (!bulkLoading) setBulkDeleteOpen(false); }}
        />
      )}
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
              <button
                onClick={() => setCreateOpen(true)}
                className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Create User
              </button>
            </div>

            {/* Toolbar */}
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
                  <button onClick={() => setSearch('')} className="ml-1 text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 px-2">
                {/* Role filter */}
                <div ref={filterRef} className="relative">
                  <button
                    onClick={() => { setFilterOpen((o) => !o); setStatusOpen(false); setSortOpen(false); }}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      filterRole !== 'ALL' ? 'text-primary bg-primary-container/30 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    {filterRole === 'ALL' ? 'Role' : filterRole}
                    <span className="material-symbols-outlined text-[16px]">{filterOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                      {(['ALL', 'ADMIN', 'USER'] as RoleFilter[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setFilterRole(opt); setFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                            filterRole === opt ? 'text-primary bg-primary-container/20 font-medium' : 'text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <span>{opt === 'ALL' ? 'All roles' : opt === 'ADMIN' ? 'Admin' : 'User'}</span>
                          {filterRole === opt && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status filter */}
                <div ref={statusRef} className="relative">
                  <button
                    onClick={() => { setStatusOpen((o) => !o); setFilterOpen(false); setSortOpen(false); }}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      filterStatus !== 'ALL' ? 'text-primary bg-primary-container/30 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    {filterStatus === 'ALL' ? 'Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}
                    <span className="material-symbols-outlined text-[16px]">{statusOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                      {(['ALL', 'ACTIVE', 'PENDING', 'REJECTED'] as StatusFilter[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setFilterStatus(opt); setStatusOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                            filterStatus === opt ? 'text-primary bg-primary-container/20 font-medium' : 'text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <span>{opt === 'ALL' ? 'All statuses' : opt.charAt(0) + opt.slice(1).toLowerCase()}</span>
                          {filterStatus === opt && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-4 bg-outline-variant/30 mx-1" />

                {/* Sort */}
                <div ref={sortRef} className="relative">
                  <button
                    onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); setStatusOpen(false); }}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      sortBy !== 'newest' ? 'text-primary bg-primary-container/30 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">sort</span>
                    {sortBy !== 'newest' ? SORT_LABELS[sortBy] : 'Sort'}
                    <span className="material-symbols-outlined text-[16px]">{sortOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface rounded-xl border border-outline-variant/20 shadow-lg z-20 overflow-hidden py-1">
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([opt, label]) => (
                        <button
                          key={opt}
                          onClick={() => { setSortBy(opt); setSortOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                            sortBy === opt ? 'text-primary bg-primary-container/20 font-medium' : 'text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <span>{label}</span>
                          {sortBy === opt && <span className="material-symbols-outlined text-[16px]">check</span>}
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

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="flex items-center justify-between bg-primary-container/20 border border-primary/20 rounded-xl px-5 py-3">
                <span className="text-sm font-medium text-primary">
                  {n} user{n !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBulkDeleteOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-error-container/30 text-error hover:bg-error-container/50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete selected
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-low bg-surface/50">
                    <th className="px-4 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">Full Name</th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">Email</th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">Role</th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">Status</th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">Joined</th>
                    <th className="px-6 py-4 text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">Loading users…</td>
                    </tr>
                  )}
                  {!loading && visibleUsers.length === 0 && !error && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">
                        {users.length === 0 ? 'No users found.' : 'No users match your search or filters.'}
                      </td>
                    </tr>
                  )}
                  {visibleUsers.map((user) => {
                    const isSelected = selected.has(user.id);
                    return (
                      <tr
                        key={user.id}
                        onClick={(e) => handleRowClick(user.id, e)}
                        className={`group border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-primary-container/10 hover:bg-primary-container/15' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        {/* Checkbox cell — stops row click so checkbox onChange handles it */}
                        <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const isShift = (e.nativeEvent as MouseEvent).shiftKey;
                              if (isShift && lastClickedId) rangeSelect(user.id);
                              else toggleUser(user.id);
                            }}
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
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
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-tertiary-container text-on-tertiary-container text-xs font-medium">ADMIN</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-xs font-medium">USER</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.accountStatus} />
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 text-right" data-no-select="">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors"
                              title="Edit User"
                              onClick={() => setEditTarget(user)}
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
