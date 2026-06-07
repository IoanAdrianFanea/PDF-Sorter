import { AdminTabs } from '../../components/admin/AdminTabs';

export default function AdminArchive() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-headline font-bold text-on-surface mb-2 tracking-tight">
              Archive
            </h1>
            <p className="text-body-md font-body text-on-surface-variant">
              Manage and restore previously archived project data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-sm">search</span>
              </div>
              <input
                className="block w-64 pl-9 pr-3 py-1.5 bg-surface-container-low border-b border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 text-body-md font-body text-on-surface transition-all duration-200 outline-none rounded-t-lg placeholder-outline"
                placeholder="Search archive..."
                type="text"
              />
            </div>
            <button className="px-3 py-1.5 text-body-md font-body font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low border-b border-surface-container-highest">
              <div className="col-span-5 text-label-md font-label uppercase tracking-wider text-outline font-semibold">
                Project Name
              </div>
              <div className="col-span-3 text-label-md font-label uppercase tracking-wider text-outline font-semibold">
                Archived Date
              </div>
              <div className="col-span-2 text-label-md font-label uppercase tracking-wider text-outline font-semibold">
                File Size
              </div>
              <div className="col-span-2 text-label-md font-label uppercase tracking-wider text-outline font-semibold text-right">
                Actions
              </div>
            </div>

            <div className="divide-y divide-surface-container-highest">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-sm">folder_zip</span>
                  </div>
                  <div>
                    <p className="text-body-md font-body font-medium text-on-surface">
                      Q3 Financial Reports 2022
                    </p>
                    <p className="text-xs font-body text-outline mt-0.5">ID: PRJ-9928-ARCH</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <p className="text-body-md font-body text-on-surface-variant">Oct 12, 2023</p>
                  <p className="text-xs font-body text-outline mt-0.5">by Sarah Jenkins</p>
                </div>
                <div className="col-span-2">
                  <p className="text-body-md font-body text-on-surface-variant">1.4 GB</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Download Zip">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Restore">
                    <span className="material-symbols-outlined text-sm">restore</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors" title="Delete Permanently">
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-sm">folder_zip</span>
                  </div>
                  <div>
                    <p className="text-body-md font-body font-medium text-on-surface">
                      Legacy API Documentation V1
                    </p>
                    <p className="text-xs font-body text-outline mt-0.5">ID: PRJ-8812-ARCH</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <p className="text-body-md font-body text-on-surface-variant">Sep 05, 2023</p>
                  <p className="text-xs font-body text-outline mt-0.5">by System</p>
                </div>
                <div className="col-span-2">
                  <p className="text-body-md font-body text-on-surface-variant">450 MB</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Download Zip">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Restore">
                    <span className="material-symbols-outlined text-sm">restore</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors" title="Delete Permanently">
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-sm">folder_zip</span>
                  </div>
                  <div>
                    <p className="text-body-md font-body font-medium text-on-surface">Marketing Assets Q1-Q2</p>
                    <p className="text-xs font-body text-outline mt-0.5">ID: PRJ-7734-ARCH</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <p className="text-body-md font-body text-on-surface-variant">Aug 22, 2023</p>
                  <p className="text-xs font-body text-outline mt-0.5">by Mike T.</p>
                </div>
                <div className="col-span-2">
                  <p className="text-body-md font-body text-on-surface-variant">3.2 GB</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Download Zip">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded transition-colors" title="Restore">
                    <span className="material-symbols-outlined text-sm">restore</span>
                  </button>
                  <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors" title="Delete Permanently">
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-container-lowest border-t border-surface-container-highest flex justify-between items-center">
              <p className="text-xs font-body text-outline">Showing 1-3 of 24 archived projects</p>
              <div className="flex items-center gap-1">
                <button className="p-1 text-outline hover:text-on-surface transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-1 text-on-surface hover:bg-surface-container rounded transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
