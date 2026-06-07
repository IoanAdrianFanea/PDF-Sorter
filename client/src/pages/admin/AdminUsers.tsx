import { AdminTabs } from '../../components/admin/AdminTabs';

export default function AdminUsers() {
  return (
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
              <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Invite User
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
              />
            </div>
            <div className="flex items-center gap-2 px-2">
              <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>
              <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">sort</span>
                Sort
              </button>
            </div>
          </div>

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
                    Status
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
                <tr className="group border-b border-surface-container-low/50 last:border-0 transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                        JD
                      </div>
                      <span className="font-medium text-on-surface">Jane Doe</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">jane.doe@example.com</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-tertiary-container text-on-tertiary-container text-xs font-medium">
                      ADMIN
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">Oct 12, 2023</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors" title="Change Role">
                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="group border-b border-surface-container-low/50 last:border-0 transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                        JS
                      </div>
                      <span className="font-medium text-on-surface">John Smith</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">john.smith@example.com</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-xs font-medium">
                      USER
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">Nov 05, 2023</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors" title="Change Role">
                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="group border-b border-surface-container-low/50 last:border-0 transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-xs border border-dashed border-outline-variant">
                        AL
                      </div>
                      <span className="font-medium text-on-surface">Alice Lee</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">alice.lee@example.com</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-xs font-medium">
                      USER
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                      PENDING
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">-</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs font-medium text-primary hover:text-primary-dim px-2 py-1 bg-primary-container/30 rounded transition-colors mr-2">
                        Resend
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
