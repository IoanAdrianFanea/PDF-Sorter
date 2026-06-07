interface ArchiveProjectModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
}

export function ArchiveProjectModal({ isOpen, projectName, onClose }: ArchiveProjectModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-tertiary-container text-tertiary-dim flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface">Archive Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="bg-tertiary-container/30 border border-tertiary-dim/20 rounded-lg p-4 mb-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary-dim text-[20px] mt-0.5 shrink-0">info</span>
            <div>
              <p className="text-label-md font-semibold text-on-surface mb-1">Are you sure?</p>
              <p className="text-body-sm text-on-surface-variant">
                <span className="font-medium text-on-surface">"{projectName}"</span> will be archived and hidden from
                active views. Members will lose access until the project is restored.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-label-md font-semibold bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Archive Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
