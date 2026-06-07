import { useEffect, useRef, useState } from 'react';
import { renameProject } from '../../api/projects';

interface RenameProjectModalProps {
  isOpen: boolean;
  projectId: string;
  currentName: string;
  onClose: () => void;
  onRenamed: (id: string, newName: string) => void;
}

export function RenameProjectModal({ isOpen, projectId, currentName, onClose, onRenamed }: RenameProjectModalProps) {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync name when the modal opens for a (possibly different) project
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError('');
      // Focus the input after the modal renders
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Project name cannot be empty.');
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await renameProject(projectId, trimmed);
      onRenamed(projectId, trimmed);
      onClose();
    } catch {
      setError('Failed to rename project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
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
            <div className="w-9 h-9 rounded-lg bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface">Rename Project</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <p className="text-body-sm text-on-surface-variant mb-4">
            Enter a new name for <span className="font-medium text-on-surface">"{currentName}"</span>.
          </p>

          <div className="mb-1">
            <label htmlFor="project-name" className="block text-label-sm font-medium text-on-surface-variant mb-1.5">
              Project name
            </label>
            <input
              ref={inputRef}
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              disabled={isSubmitting}
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-50"
              placeholder="e.g. Q4 Financial Review"
            />
          </div>

          {error && (
            <p className="mt-2 text-label-sm text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-label-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 rounded-lg text-label-md font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
