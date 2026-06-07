import { AdminTabs } from '../../components/admin/AdminTabs';

export default function AdminFilters() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-headline-sm font-headline font-bold text-on-surface mb-2">Filter Settings</h1>
            <p className="text-body-md font-body text-on-surface-variant">
              Manage custom filters for document processing and routing.
            </p>
          </div>

          <div className="bg-error-container/20 border-l-4 border-error text-on-error-container p-4 rounded-r-xl mb-8 flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5">warning</span>
            <div>
              <h3 className="font-label font-bold text-sm mb-1">Maximum Capacity Reached</h3>
              <p className="text-body-md font-body opacity-90">
                You have reached the limit of 5 active custom filters. Please delete an existing filter before creating a
                new one, or upgrade your plan.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-surface-container-low bg-surface-bright flex justify-between items-center">
              <h2 className="font-headline font-semibold text-on-surface">Active Custom Filters (5/5)</h2>
            </div>
            <div className="divide-y divide-surface-container-low">
              {[
                {
                  name: 'High Priority Invoices',
                  type: 'Keyword Match',
                  date: 'Oct 12, 2023',
                },
                {
                  name: 'Q3 Tax Documents',
                  type: 'Date Range',
                  date: 'Oct 15, 2023',
                },
                {
                  name: "Vendor 'Acme Corp'",
                  type: 'Entity Extraction',
                  date: 'Nov 02, 2023',
                },
                {
                  name: 'Confidential HR Docs',
                  type: 'Regex Pattern',
                  date: 'Nov 18, 2023',
                },
                {
                  name: 'Legacy Archival',
                  type: 'Status Check',
                  date: 'Dec 01, 2023',
                },
              ].map((filter) => (
                <div
                  key={filter.name}
                  className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">filter_alt</span>
                    </div>
                    <div>
                      <h4 className="font-label font-semibold text-on-surface">{filter.name}</h4>
                      <div className="flex items-center gap-2 text-xs font-body text-on-surface-variant mt-1">
                        <span className="bg-surface-container-high px-2 py-0.5 rounded">{filter.type}</span>
                        <span>•</span>
                        <span>Created {filter.date}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-outline hover:text-error transition-colors p-2 rounded-lg hover:bg-error-container/10 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 opacity-60">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-outline">add_circle</span>
              <h3 className="font-headline font-semibold text-on-surface">Add New Filter</h3>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label text-on-surface-variant mb-1">Filter Name</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-body-md font-body text-on-surface opacity-50 cursor-not-allowed"
                    disabled
                    placeholder="e.g. Urgent Processing"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label text-on-surface-variant mb-1">Filter Type</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-body-md font-body text-on-surface opacity-50 cursor-not-allowed appearance-none"
                    disabled
                  >
                    <option>Select type...</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <button
                  className="bg-outline-variant/20 text-on-surface-variant font-label text-label-md px-4 py-2 rounded-lg cursor-not-allowed"
                  disabled
                  type="button"
                >
                  Create Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
