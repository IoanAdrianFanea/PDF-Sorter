import { useCallback, useEffect, useState } from 'react';
import { AdminTabs } from '../../components/admin/AdminTabs';
import {
  getDeletedDocuments,
  permanentlyDeleteDocument,
  restoreDocument,
  type DeletedDocument,
} from '../../api/recycleBin';

type PendingAction = { type: 'restore' | 'purge'; document: DeletedDocument } | null;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  return mimeType === 'application/pdf' ? 'picture_as_pdf' : 'image';
}

interface ConfirmModalProps {
  action: PendingAction;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({ action, isLoading, onConfirm, onClose }: ConfirmModalProps) {
  if (!action) return null;

  const isPurge = action.type === 'purge';
  const title = isPurge ? 'Delete Permanently' : 'Restore Document';
  const message = isPurge
    ? `"${action.document.originalFilename}" and its file will be removed for good. The deletion log entry is kept for auditing. This cannot be undone.`
    : `"${action.document.originalFilename}" will be returned to ${action.document.projectName} and become visible again.`;
  const confirmLabel = isPurge ? 'Delete Permanently' : 'Restore';
  const btnClass = isPurge
    ? 'bg-error text-on-error hover:bg-error/90'
    : 'bg-primary text-on-primary hover:bg-primary/90';

  return (
    <div
      className="fixed inset-0 bg-scrim/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm mx-4">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
          <p className="text-body-sm text-on-surface-variant mt-2">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${btnClass}`}
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRecycleBin() {
  const [documents, setDocuments] = useState<DeletedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isActing, setIsActing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setDocuments(await getDeletedDocuments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the recycle bin');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirm = async () => {
    if (!pendingAction) return;

    setIsActing(true);
    setError('');
    try {
      if (pendingAction.type === 'restore') {
        await restoreDocument(pendingAction.document.id);
      } else {
        await permanentlyDeleteDocument(pendingAction.document.id);
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== pendingAction.document.id));
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsActing(false);
    }
  };

  const retentionDays = documents[0]?.retentionDays ?? 30;

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
      <ConfirmModal
        action={pendingAction}
        isLoading={isActing}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />

      <div className="bg-surface pt-6 px-10 shrink-0 sticky top-0 z-10">
        <AdminTabs />
      </div>

      <div className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-headline-sm font-headline font-bold text-on-surface">Recycle Bin</h1>
          <button
            onClick={() => void load()}
            className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg flex items-center gap-2 text-label-md font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>
        <p className="text-body-sm text-on-surface-variant mb-8">
          Deleted documents are kept for {retentionDays} days and are then permanently removed.
          Deletions stay in the audit log either way.
        </p>

        {error && (
          <p className="mb-4 text-label-sm text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </p>
        )}

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low/50 text-label-md font-label uppercase tracking-wider text-outline">
                <th className="px-6 py-4 font-medium w-1/3">Document</th>
                <th className="px-6 py-4 font-medium w-1/6">Project</th>
                <th className="px-6 py-4 font-medium w-1/6">Deleted By</th>
                <th className="px-6 py-4 font-medium w-1/6">Deleted On</th>
                <th className="px-6 py-4 font-medium w-1/12">Expires</th>
                <th className="px-6 py-4 font-medium w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface divide-y divide-outline-variant/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-5 text-center text-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-5 text-center text-on-surface-variant">
                    The recycle bin is empty
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-error-container text-error flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">
                            {fileIcon(doc.mimeType)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-on-surface block truncate">
                            {doc.originalFilename}
                          </span>
                          <span className="text-label-sm text-on-surface-variant">
                            {formatSize(doc.sizeBytes)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">{doc.projectName}</td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {doc.deletedByName || doc.deletedByEmail || 'Unknown'}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {formatDate(doc.deletedAt)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                          doc.daysRemaining <= 5
                            ? 'bg-error-container/50 text-error'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {doc.daysRemaining === 0
                          ? 'Today'
                          : `${doc.daysRemaining} day${doc.daysRemaining !== 1 ? 's' : ''}`}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setPendingAction({ type: 'restore', document: doc })}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/50 rounded transition-colors"
                          title="Restore"
                        >
                          <span className="material-symbols-outlined text-[18px]">restore</span>
                        </button>
                        <button
                          onClick={() => setPendingAction({ type: 'purge', document: doc })}
                          className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors"
                          title="Delete Permanently"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete_forever
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
