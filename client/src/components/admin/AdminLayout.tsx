import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminTabs } from './AdminTabs';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="bg-surface text-on-surface font-body h-screen flex flex-col overflow-hidden">
      <header className="bg-surface-container-lowest shadow-sm flex justify-between items-center w-full px-6 h-16 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              folder_open
            </span>
          </div>
          <span className="text-xl font-headline font-black text-on-surface">DocIndex Manager</span>
        </div>
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-0 text-body-md font-body text-on-surface placeholder:text-on-surface-variant rounded-xl pl-10 pr-12 py-2 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
              placeholder="Search documents or content..."
              type="text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                Cmd
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                K
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="bg-primary text-on-primary font-label text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Upload
          </button>
          <button className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">account_circle</span>
            Account
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="bg-surface-container w-64 h-full flex flex-col shrink-0 overflow-y-auto border-r border-surface-container-low hidden md:flex">
          <div className="p-4 flex flex-col gap-6">
            <div>
              <h3 className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant mb-2 px-4 font-bold">
                Views
              </h3>
              <nav className="flex flex-col gap-1">
                <Link
                  className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-2.5 transition-colors group"
                  to="/documents"
                >
                  <span className="material-symbols-outlined text-xl group-hover:text-on-surface transition-colors">
                    grid_view
                  </span>
                  <span className="text-body-md font-medium">All Documents</span>
                </Link>
                <Link
                  className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-2.5 transition-colors group"
                  to="/jobs"
                >
                  <span className="material-symbols-outlined text-xl group-hover:text-on-surface transition-colors">
                    work_outline
                  </span>
                  <span className="text-body-md font-medium">Jobs</span>
                </Link>
                <Link
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                    isAdminPage
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  to="/admin/projects"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    admin_panel_settings
                  </span>
                  <span className="text-body-md">Admin Console</span>
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant mb-2 px-4 font-bold">
                Status
              </h3>
              <nav className="flex flex-col gap-1">
                {['Uploaded', 'Queued', 'Processing', 'Processed', 'Failed'].map((status) => (
                  <div
                    key={status}
                    className="flex items-center justify-between text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-[3px] border border-outline-variant bg-surface-container-lowest"></div>
                      <span className="text-body-md font-medium text-sm">{status}</span>
                    </div>
                    <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-1.5 py-0.5 rounded">
                      0
                    </span>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-surface-container-low/50">
            <button className="w-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-label text-sm font-semibold py-2 rounded-lg transition-colors">
              Upgrade Plan
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-surface">
          <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
            <AdminTabs />
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
