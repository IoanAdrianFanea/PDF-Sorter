import { useState } from 'react';
import { exportDocuments } from '../../api/exports';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentIds: string[];
}

export function ExportModal({ isOpen, onClose, documentIds }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDocuments(documentIds);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export documents');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export Documents</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            disabled={isExporting}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 text-sm mb-1">
                  Export as ZIP Archive
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {documentIds.length} {documentIds.length === 1 ? 'document' : 'documents'} will be packaged into a ZIP file for download.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
