import { useState } from 'react';
import { deleteProject } from '../../api/projects';

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  memberCount: number;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteProjectModal({ isOpen, projectId, projectName, memberCount, onClose, onDeleted }: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteProject(projectId);
      onDeleted(projectId);
      onClose();
    } catch {
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) onClose();
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
            <div className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface">Delete Project</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Warning banner */}
          <div className="bg-error-container/30 border border-error/20 rounded-lg p-4 mb-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">warning</span>
            <div>
              <p className="text-label-md font-semibold text-error mb-1">This action cannot be undone</p>
              <p className="text-body-sm text-on-surface-variant">
                Deleting <span className="font-medium text-on-surface">"{projectName}"</span> will permanently remove the
                project{memberCount > 0 ? ` and all ${memberCount} membership${memberCount !== 1 ? 's' : ''} assigned to it` : ''}.
              </p>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-label-sm text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-label-md font-semibold bg-error text-on-error hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
