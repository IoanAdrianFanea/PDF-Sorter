import { AdminTabs } from '../../components/admin/AdminTabs';

export default function AdminProjects() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-headline-sm font-headline font-bold text-on-surface">Projects</h1>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center gap-2 text-label-md font-semibold hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add</span>
            New Project
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low/50 text-label-md font-label uppercase tracking-wider text-outline">
                <th className="px-6 py-4 font-medium w-1/3">Project Name</th>
                <th className="px-6 py-4 font-medium w-1/6">Members</th>
                <th className="px-6 py-4 font-medium w-1/4">Created Date</th>
                <th className="px-6 py-4 font-medium w-1/4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface divide-y divide-outline-variant/5">
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-container text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">view_kanban</span>
                    </div>
                    <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                      Q3 Financial Audit
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-container border-2 border-surface-container-lowest flex items-center justify-center text-xs font-bold text-secondary-dim">
                      JD
                    </div>
                    <div className="w-7 h-7 rounded-full bg-tertiary-container border-2 border-surface-container-lowest flex items-center justify-center text-xs font-bold text-tertiary-dim">
                      AK
                    </div>
                    <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-xs font-medium text-outline">
                      +3
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">Oct 12, 2023</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Manage Members">
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Rename">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Archive">
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    </button>
                    <button className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-secondary-container text-secondary-dim flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">article</span>
                    </div>
                    <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                      Marketing Assets 2024
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-tertiary-container border-2 border-surface-container-lowest flex items-center justify-center text-xs font-bold text-tertiary-dim">
                      SM
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">Nov 05, 2023</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Manage Members">
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Rename">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Archive">
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    </button>
                    <button className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-tertiary-container text-tertiary-dim flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">gavel</span>
                    </div>
                    <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                      Legal Contracts - EU Region
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-container border-2 border-surface-container-lowest flex items-center justify-center text-xs font-bold text-secondary-dim">
                      LJ
                    </div>
                    <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-xs font-medium text-outline">
                      +1
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant">Dec 01, 2023</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Manage Members">
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Rename">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors" title="Archive">
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    </button>
                    <button className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
