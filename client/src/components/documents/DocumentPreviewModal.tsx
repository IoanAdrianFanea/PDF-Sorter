import { useState } from 'react';
import type { Document } from '../../types';
import { downloadDocument } from '../../api/exports';

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDocument(document.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                <span className="material-symbols-outlined text-[20px] block">picture_as_pdf</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">{document.fileName}</h2>
                <p className="text-sm text-slate-500">{document.fileSize}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Uploaded By</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">{document.uploadedBy || 'Unknown'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">{document.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Date Uploaded</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">{document.uploadDate}</p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 text-center bg-slate-50/80 dark:bg-slate-800/30">
              <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">description</span>
              <p className="text-slate-700 dark:text-slate-200 font-medium">Preview panel</p>
              <p className="text-sm text-slate-500 mt-1">A full PDF viewer will be connected in backend integration.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 disabled:opacity-70 text-white text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
