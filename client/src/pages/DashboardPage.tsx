import { useState } from 'react';
import UploadPanel from '../components/dashboard/UploadPanel';
import LibraryPanel from '../components/dashboard/LibraryPanel';
import PreviewPanel from '../components/dashboard/PreviewPanel';
import { mockDocuments } from '../model_data/mockData';
import type { Document } from '../model_data/mockData';

export type GroupByMode = 'category' | 'source' | 'date' | 'name' | null;

export default function DashboardPage() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    mockDocuments[0]
  );
  const [groupBy, setGroupBy] = useState<GroupByMode>('category');

  const handleOrganize = (mode: GroupByMode) => {
    setGroupBy(mode);
  };

  const handleReset = () => {
    setGroupBy(null);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-10 py-3 dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            PDF Manager
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <a
              className="text-sm font-semibold text-slate-900 hover:text-primary dark:text-slate-100 dark:hover:text-primary"
              href="#"
            >
              Dashboard
            </a>
            <a
              className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
              href="#"
            >
              Documents
            </a>
            <a
              className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
              href="#"
            >
              Settings
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div
              className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-slate-800 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEx0_RaikANufkk1jyi8WxUPl_YA1JK526gUi9rWbb5Gq038csb_zdXfNan0eRblDw49-wYQNGhH3AVRQki3LKbYqXgjpPEnbSP3iFkqqc8JNldrm4B5KW4u3zrFzxUEja35KsiwIA6NZxfHCwBCVRjTprDJ0SJ9vw6h9bsYRFikT_x_lyd65AhpWw-Ur55lupPw_aQYqcPTdeok0BiywIdg3P5SM4xHCoF5gzKbsSAev9T-Q15Zsf4l6p55mSqkquQOtS2jomyWk")',
              }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:px-10 lg:px-20 xl:px-40">
        <div className="mx-auto max-w-7xl space-y-[40px]">
          <UploadPanel />
          <LibraryPanel
            documents={mockDocuments}
            onDocumentSelect={setSelectedDocument}
            groupBy={groupBy}
            onOrganize={handleOrganize}
            onReset={handleReset}
          />
          <PreviewPanel document={selectedDocument} />
        </div>
      </main>
    </div>
  );
}
