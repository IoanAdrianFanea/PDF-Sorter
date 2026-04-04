import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Document } from '../types';
import { documentsService } from '../api/documents';
import type { Document as ApiDocument } from '../api/documents';
import { downloadDocument } from '../api/exports';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
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

  const allProjectsLabel = 'All Projects';
  const projectStorageKey = 'documents:selectedProject';
  const [selectedProject, setSelectedProject] = useState<string>(() => {
    return sessionStorage.getItem(projectStorageKey) || allProjectsLabel;
  });
  const [sortBy, setSortBy] = useState<'upload-newest' | 'upload-oldest' | 'name-asc' | 'name-desc' | 'status'>('upload-newest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('');
  const [quantityFilter, setQuantityFilter] = useState('');
  const [orderNumberFilter, setOrderNumberFilter] = useState('');
  const [deliveryFromFilter, setDeliveryFromFilter] = useState('');
  const [deliveryToFilter, setDeliveryToFilter] = useState('');

  const projectOptions = [allProjectsLabel, 'North Tower Build', 'Highway Bridge Lot 7', 'Warehouse Extension'];
  const materialTypeOptions = ['', 'Concrete', 'Steel', 'Lumber', 'Electrical', 'Plumbing'];

  // Fetch documents on mount
  useEffect(() => {
    sessionStorage.setItem(projectStorageKey, selectedProject);
  }, [selectedProject]);

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

    const existing = documents.find((doc) => doc.id === id);
    if (existing) {
      setSelectedDocument(existing);
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
  }, [id, documents]);

  const sortedDocuments = useMemo(() => {
    const copy = [...documents];

    switch (sortBy) {
      case 'upload-oldest':
        return copy.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
      case 'name-asc':
        return copy.sort((a, b) => a.fileName.localeCompare(b.fileName));
      case 'name-desc':
        return copy.sort((a, b) => b.fileName.localeCompare(a.fileName));
      case 'status':
        return copy.sort((a, b) => a.status.localeCompare(b.status));
      case 'upload-newest':
      default:
        return copy.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }
  }, [documents, sortBy]);

  const activeFilterTags = [
    selectedProject !== allProjectsLabel ? { key: 'project', label: `Project: ${selectedProject}` } : null,
    supplierFilter ? { key: 'supplier', label: `Supplier: ${supplierFilter}` } : null,
    materialTypeFilter ? { key: 'materialType', label: `Material Type: ${materialTypeFilter}` } : null,
    quantityFilter ? { key: 'quantity', label: `Quantity: ${quantityFilter}` } : null,
    orderNumberFilter ? { key: 'orderNumber', label: `Order #: ${orderNumberFilter}` } : null,
    deliveryFromFilter || deliveryToFilter
      ? {
          key: 'deliveryDate',
          label: `Delivery: ${deliveryFromFilter || 'Any'} to ${deliveryToFilter || 'Any'}`,
        }
      : null,
  ].filter((tag): tag is { key: string; label: string } => Boolean(tag));

  const handleSelectDocument = (docId: string) => {
    navigate(`/documents/${docId}`);
  };

  const handleClosePreview = () => {
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

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await downloadDocument(documentId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download document');
    }
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
      
      // Refresh documents list
      setDocuments((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete documents');
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const removeFilterTag = (key: string) => {
    if (key === 'project') setSelectedProject(allProjectsLabel);
    if (key === 'supplier') setSupplierFilter('');
    if (key === 'materialType') setMaterialTypeFilter('');
    if (key === 'quantity') setQuantityFilter('');
    if (key === 'orderNumber') setOrderNumberFilter('');
    if (key === 'deliveryDate') {
      setDeliveryFromFilter('');
      setDeliveryToFilter('');
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="h-10 min-w-56 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200"
              >
                {projectOptions.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filter
              </button>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-10 min-w-52 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200"
              >
                <option value="upload-newest">Date Uploaded: Newest first</option>
                <option value="upload-oldest">Date Uploaded: Oldest first</option>
                <option value="name-asc">Document Name: A to Z</option>
                <option value="name-desc">Document Name: Z to A</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="text-sm text-slate-500">
              Showing 1-{sortedDocuments.length} of {sortedDocuments.length}
            </div>
          </div>

          {selectedProject !== allProjectsLabel && (
            <div className="rounded-lg border border-blue-200 dark:border-blue-900/30 bg-blue-50/70 dark:bg-blue-900/10 px-4 py-2 text-sm text-blue-800 dark:text-blue-200">
              Viewing project: <span className="font-semibold">{selectedProject}</span>
            </div>
          )}

          {activeFilterTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => removeFilterTag(tag.key)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-100"
                >
                  {tag.label}
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              ))}
            </div>
          )}

          {isFilterPanelOpen && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                  >
                    {projectOptions.map((project) => (
                      <option key={`filter-${project}`} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    placeholder="e.g. Acme Materials"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Material Type</label>
                  <select
                    value={materialTypeFilter}
                    onChange={(e) => setMaterialTypeFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                  >
                    <option value="">All Material Types</option>
                    {materialTypeOptions
                      .filter((option) => option)
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={quantityFilter}
                    onChange={(e) => setQuantityFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    placeholder="e.g. 500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Order Number</label>
                  <input
                    type="text"
                    value={orderNumberFilter}
                    onChange={(e) => setOrderNumberFilter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    placeholder="e.g. PO-2026-114"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Delivery Date (range)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={deliveryFromFilter}
                      onChange={(e) => setDeliveryFromFilter(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="date"
                      value={deliveryToFilter}
                      onChange={(e) => setDeliveryToFilter(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500">Filter inputs are UI-only for now. Data filtering will be connected later.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(allProjectsLabel);
                    setSupplierFilter('');
                    setMaterialTypeFilter('');
                    setQuantityFilter('');
                    setOrderNumberFilter('');
                    setDeliveryFromFilter('');
                    setDeliveryToFilter('');
                  }}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
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
        ) : sortedDocuments.length === 0 ? (
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
            documents={sortedDocuments}
            selectedDocumentId={selectedDocument?.id || null}
            selectedIds={selectedIds}
            onSelectDocument={handleSelectDocument}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDownloadDocument={handleDownloadDocument}
          />
        )}
      </main>

      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument} 
          onClose={handleClosePreview}
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
