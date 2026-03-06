import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { documentsService, type SearchResult } from '../api/documents';
import type { Document } from '../types';
import { DocumentDrawer } from '../components/documents/DocumentDrawer';

export default function Search() {
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

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
          tags: [],
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
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Found {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              {results.map((result) => (
                <Link
                  key={result.documentId}
                  to={`/search/${result.documentId}${query ? `?q=${encodeURIComponent(query)}` : ''}`}
                  className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedDocument && <DocumentDrawer document={selectedDocument} onClose={handleCloseDrawer} />}
    </>
  );
}
