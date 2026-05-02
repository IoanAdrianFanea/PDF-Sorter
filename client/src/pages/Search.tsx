import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { documentsService, type SearchResult } from '../api/documents';
import type { Document } from '../types';
import { DocumentDrawer } from '../components/documents/DocumentDrawer';
import { BulkActionBar } from '../components/documents/BulkActionBar';
import { ExportModal } from '../components/documents/ExportModal';

export default function Search() {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Don't search if query is empty or too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // Perform search
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await documentsService.searchDocuments(query);
        setResults(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Fetch selected document details when ID is in URL
  useEffect(() => {
    if (!id) {
      setSelectedDocument(null);
      return;
    }

    const fetchDocument = async () => {
      try {
        const apiDoc = await documentsService.getDocument(id);
        // Convert API document to UI document
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };

        const formatDate = (dateString: string): string => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        const doc: Document = {
          id: apiDoc.id,
          fileName: apiDoc.originalFilename,
          fileSize: formatFileSize(apiDoc.sizeBytes),
          status: apiDoc.status,
          uploadDate: formatDate(apiDoc.uploadedAt),
          uploadedBy: 'You',
          pageCount: apiDoc.pageCount || undefined,
          extractedText: apiDoc.textPreview || undefined,
        };

        setSelectedDocument(doc);
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setSelectedDocument(null);
      }
    };

    fetchDocument();
  }, [id]);

  const handleCloseDrawer = () => {
    // Navigate back to search with query preserved
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentsService.deleteDocument(documentId);
      // Close drawer and navigate back to search
      navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
      // Remove document from results
      setResults((prev) => prev.filter((r) => r.documentId !== documentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleToggleSelect = (documentId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(results.map((r) => r.documentId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleExportSelected = () => {
    setShowExportModal(true);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected documents? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await documentsService.bulkDeleteDocuments(Array.from(selectedIds));
      
      // Show result if some failed
      if (result.failed.length > 0) {
        alert(`Deleted ${result.deleted} documents. Failed to delete ${result.failed.length} documents.`);
      }
      
      // Clear selection
      setSelectedIds(new Set());
      
      // Remove deleted documents from results
      setResults((prev) => prev.filter((r) => !selectedIds.has(r.documentId)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete documents');
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const allSelected = results.length > 0 && selectedIds.size === results.length;

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Search Results
              </h2>
              {query && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Searching for: <span className="font-medium text-slate-700 dark:text-slate-300">"{query}"</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Searching...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-200">Search Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty Query State */}
          {!query && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">search</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Enter a search query
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Use the search bar above to find documents by their content. Search must be at least 2 characters.
              </p>
            </div>
          )}

          {/* No Results State */}
          {query && query.trim().length >= 2 && !isLoading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                No documents contain "{query}". Try a different search term.
              </p>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Select All
                    </span>
                  </label>
                  {selectedIds.size > 0 && (
                    <span className="text-sm text-slate-500">
                      ({selectedIds.size} selected)
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
              {results.map((result) => {
                const isSelected = selectedIds.has(result.documentId);
                return (
                  <div
                    key={result.documentId}
                    className={`bg-white dark:bg-slate-800 border rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(result.documentId)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <Link
                        to={`/search/${result.documentId}${query ? `?q=${encodeURIComponent(query)}` : ''}`}
                        className="flex items-start gap-3 flex-1 min-w-0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-red-600 dark:text-red-400">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-white mb-2 truncate">
                            {result.filename}
                          </h3>
                          <div
                            className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: result.snippet }}
                          />
                        </div>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 shrink-0">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedDocument && (
        <DocumentDrawer 
          document={selectedDocument} 
          onClose={handleCloseDrawer} 
          onDelete={handleDeleteDocument}
        />
      )}

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onExport={handleExportSelected}
          onDelete={handleDeleteSelected}
          onClear={handleClearSelection}
        />
      )}

      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        documentIds={Array.from(selectedIds)}
      />
    </>
  );
}
