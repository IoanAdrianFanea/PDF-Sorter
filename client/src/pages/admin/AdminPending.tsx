import { AdminTabs } from '../../components/admin/AdminTabs';

export default function AdminPending() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-headline-sm font-headline font-bold text-on-surface">Pending Registrations</h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Review and approve new user access requests.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex flex-col group hover:bg-surface-container-low transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline font-bold text-lg">
                  SJ
                </div>
                <span className="text-[10px] font-label font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                  2 hours ago
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-body-md font-bold text-on-surface">Sarah Jenkins</h3>
                <p className="text-sm text-on-surface-variant truncate">sarah.j@acmecorp.com</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">domain</span>
                  <span className="text-xs text-tertiary">Acme Corp - Dept 42</span>
                </div>
              </div>
              <div className="mt-auto flex gap-3 pt-4 border-t border-surface-container-high/50">
                <button className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-error font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">close</span> Reject
                </button>
                <button className="flex-1 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span> Approve
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex flex-col group hover:bg-surface-container-low transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-headline font-bold text-lg">
                  MR
                </div>
                <span className="text-[10px] font-label font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                  5 hours ago
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-body-md font-bold text-on-surface">Marcus Reed</h3>
                <p className="text-sm text-on-surface-variant truncate">m.reed@globaltech.io</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">domain</span>
                  <span className="text-xs text-tertiary">Global Tech - Engineering</span>
                </div>
              </div>
              <div className="mt-auto flex gap-3 pt-4 border-t border-surface-container-high/50">
                <button className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-error font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">close</span> Reject
                </button>
                <button className="flex-1 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span> Approve
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex flex-col group hover:bg-surface-container-low transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed font-headline font-bold text-lg">
                  AK
                </div>
                <span className="text-[10px] font-label font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                  1 day ago
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-body-md font-bold text-on-surface">Amina Khan</h3>
                <p className="text-sm text-on-surface-variant truncate">akhan@freelance.org</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">person</span>
                  <span className="text-xs text-tertiary">Independent Contractor</span>
                </div>
              </div>
              <div className="mt-auto flex gap-3 pt-4 border-t border-surface-container-high/50">
                <button className="flex-1 bg-surface-container-highest hover:bg-surface-variant text-error font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">close</span> Reject
                </button>
                <button className="flex-1 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label text-sm font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
