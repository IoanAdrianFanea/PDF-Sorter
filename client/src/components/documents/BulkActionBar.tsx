interface BulkActionBarProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, onExport, onDelete, onClear }: BulkActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-200">
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">check_circle</span>
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
          </span>
        </div>

        <div className="h-8 w-px bg-slate-700"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>

          <button
            onClick={onClear}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear selection"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
