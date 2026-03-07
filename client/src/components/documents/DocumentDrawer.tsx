import { useState, useEffect } from 'react';
import type { Document } from '../../types';
import { tagsService } from '../../api/tags';
import { documentsService } from '../../api/documents';
import type { DocumentTag } from '../../api/documents';
import { downloadDocument } from '../../api/exports';
import { useTags, registerTagDeleteCallback } from '../layout/AppShell';

interface DocumentDrawerProps {
  document: Document;
  onClose: () => void;
  onDelete: (documentId: string) => void;
  onTagsUpdated?: () => void;
}

export function DocumentDrawer({ document, onClose, onDelete, onTagsUpdated }: DocumentDrawerProps) {
  const { tags: availableTags, refreshTags } = useTags();
  const [documentTags, setDocumentTags] = useState<DocumentTag[]>([]);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch document tags
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const doc = await documentsService.getDocument(document.id);
        setDocumentTags(doc.tags || []);
      } catch (err) {
        console.error('Failed to fetch document details:', err);
      }
    };

    fetchDocumentDetails();
  }, [document.id]);

  // Close tag menu and reset states when document changes
  useEffect(() => {
    setShowTagMenu(false);
    setIsCreatingTag(false);
    setNewTagName('');
  }, [document.id]);

  // Listen for tag deletions and refresh document tags
  useEffect(() => {
    const unsubscribe = registerTagDeleteCallback((deletedTagId) => {
      // Remove the deleted tag from document tags
      setDocumentTags((prev) => prev.filter((tag) => tag.id !== deletedTagId));
      onTagsUpdated?.();
    });

    return () => {
      unsubscribe();
    };
  }, [onTagsUpdated]);

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      Safety: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
      Audit: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300',
      Invoices: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
      Blueprints: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
      Electrical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
      Permits: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300',
    };
    return colors[tag] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      await tagsService.createTag(newTagName.trim());
      await refreshTags(); // Refresh tags in context (sidebar)
      setNewTagName('');
      setIsCreatingTag(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachTag = async (tagId: string) => {
    setIsLoading(true);
    try {
      await tagsService.attachTag(document.id, tagId);
      const tag = availableTags.find((t) => t.id === tagId);
      if (tag) {
        setDocumentTags((prev) => [...prev, { id: tag.id, name: tag.name }]);
      }
      setShowTagMenu(false);
      onTagsUpdated?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to attach tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setIsLoading(true);
    try {
      await tagsService.removeTag(document.id, tagId);
      setDocumentTags((prev) => prev.filter((t) => t.id !== tagId));
      onTagsUpdated?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTagMenu = async () => {
    if (!showTagMenu) {
      // Refresh tags when opening the menu to catch any created in sidebar
      await refreshTags();
    }
    setShowTagMenu(!showTagMenu);
  };

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

  // Get tags not yet attached to this document
  const unattachedTags = availableTags.filter(
    (tag) => !documentTags.some((dt) => dt.id === tag.id)
  );

  return (
    <aside className="w-[400px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Document Details</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-slate-50">
              Open Preview
            </button>
          </div>
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">picture_as_pdf</span>
          <div className="absolute top-3 right-3 bg-white dark:bg-slate-700 rounded p-1 shadow-sm">
            <span className="material-symbols-outlined text-slate-400 text-sm">open_in_full</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white break-all leading-tight">
                {document.fileName}
              </h3>
              <button className="text-slate-400 hover:text-primary shrink-0 pt-1">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <div className="flex flex-col gap-1 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {document.uploadDate}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">hard_drive</span>
                {document.fileSize} • PDF Document
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </>
              )}
            </button>
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {documentTags.map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent hover:border-slate-300 cursor-pointer group ${getTagColor(tag.name)}`}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    disabled={isLoading}
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              ))}
              <div className="relative">
                <button
                  onClick={handleToggleTagMenu}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px] mr-1">add</span>
                  Add Tag
                </button>
                {showTagMenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {isCreatingTag ? (
                        <div className="flex gap-1 mb-2">
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateTag();
                              if (e.key === 'Escape') setIsCreatingTag(false);
                            }}
                            placeholder="Tag name..."
                            autoFocus
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={handleCreateTag}
                            disabled={isLoading || !newTagName.trim()}
                            className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCreatingTag(true)}
                          className="w-full text-left px-2 py-1.5 text-xs text-primary hover:bg-primary/5 rounded flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Create new tag
                        </button>
                      )}
                      {unattachedTags.length > 0 && (
                        <>
                          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                          <div className="max-h-32 overflow-y-auto">
                            {unattachedTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleAttachTag(tag.id)}
                                disabled={isLoading}
                                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {document.extractedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Extracted Text
                </label>
                <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded border border-green-100 dark:border-green-900/30">
                  OCR Completed
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed h-32 overflow-y-auto custom-scrollbar select-text whitespace-pre-wrap">
                  {document.extractedText}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Properties</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Author</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {document.uploadedBy || 'System Upload'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Page Count</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {document.pageCount ? `${document.pageCount} Pages` : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Dimensions</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">A4 (Portrait)</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Version</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">v1.0 (Original)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button 
          onClick={() => onDelete(document.id)}
          className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Delete Document
        </button>
      </div>
    </aside>
  );
}
