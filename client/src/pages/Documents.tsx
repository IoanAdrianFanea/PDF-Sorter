import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Document } from '../types';
import { documentsService } from '../api/documents';
import type { Document as ApiDocument } from '../api/documents';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentDrawer } from '../components/documents/DocumentDrawer';
import { BulkActionBar } from '../components/documents/BulkActionBar';
import { ExportModal } from '../components/documents/ExportModal';

// Helper to convert API document to UI document
const convertApiDocument = (apiDoc: ApiDocument): Document => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return {
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
};

export default function Documents() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const apiDocuments = await documentsService.listDocuments();
        const convertedDocuments = apiDocuments.map(convertApiDocument);
        setDocuments(convertedDocuments);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
        console.error('Failed to fetch documents:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Fetch selected document details when ID is in URL
  useEffect(() => {
    if (!id) {
      setSelectedDocument(null);
      return;
    }

    const fetchDocument = async () => {
      try {
        const apiDoc = await documentsService.getDocument(id);
        const doc = convertApiDocument(apiDoc);
        setSelectedDocument(doc);
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setSelectedDocument(null);
      }
    };

    fetchDocument();
  }, [id]);

  const handleSelectDocument = (docId: string) => {
    navigate(`/documents/${docId}`);
  };

  const handleCloseDrawer = () => {
    navigate('/documents');
  };

  const handleToggleSelect = (docId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleExportSelected = () => {
    setShowExportModal(true);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.size} selected documents?`)) {
      // TODO: Implement delete logic
      setSelectedIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span>Filter</span>
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span>Sort</span>
              <span className="material-symbols-outlined text-[16px]">sort</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Showing 1-{documents.length} of {documents.length}</span>
            <div className="flex gap-1 ml-2">
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-slate-500">Loading documents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load documents</p>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">folder_open</span>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No documents yet</p>
              <p className="text-sm text-slate-500 mb-4">Upload your first PDF to get started</p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Upload Document
              </button>
            </div>
          </div>
        ) : (
          <DocumentTable
            documents={documents}
            selectedDocumentId={selectedDocument?.id || null}
            selectedIds={selectedIds}
            onSelectDocument={handleSelectDocument}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
          />
        )}
      </main>

      {selectedDocument && <DocumentDrawer document={selectedDocument} onClose={handleCloseDrawer} />}

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onExport={handleExportSelected}
          onDelete={handleDeleteSelected}
          onClear={handleClearSelection}
        />
      )}

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </>
  );
}
