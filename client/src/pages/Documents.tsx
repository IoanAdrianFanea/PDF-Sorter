import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Document } from '../types';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentDrawer } from '../components/documents/DocumentDrawer';
import { BulkActionBar } from '../components/documents/BulkActionBar';
import { ExportModal } from '../components/documents/ExportModal';

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    fileName: 'Site_Safety_Audit_Oct23.pdf',
    fileSize: '2.4 MB',
    status: 'PROCESSED',
    tags: ['Safety', 'Audit'],
    uploadDate: 'Oct 24, 2023',
    uploadedBy: 'System Upload',
    pageCount: 14,
    extractedText: `SITE SAFETY INSPECTION REPORT
Location: Building B, North Wing
Date: 2023-10-24
Inspector: John Doe (ID: #4492)

OBSERVATIONS:
1. Temporary wiring in corridor needs guarding.
2. Fire extinguisher #B-12 expired.
3. PPE usage compliance observed at 95%.

ACTION ITEMS:
- Replace extinguisher by EOD.
- Notify electrical sub regarding wiring.

SIGNATURE: __________________`,
  },
  {
    id: '2',
    fileName: 'Vendor_Invoice_A882.pdf',
    fileSize: '1.1 MB',
    status: 'PROCESSING',
    tags: ['Invoices'],
    uploadDate: 'Oct 23, 2023',
  },
  {
    id: '3',
    fileName: 'Floor_Plan_L2_Rev3.pdf',
    fileSize: '8.4 MB',
    status: 'FAILED',
    tags: ['Blueprints'],
    uploadDate: 'Oct 23, 2023',
  },
  {
    id: '4',
    fileName: 'Electrical_Schematic_Zone4.pdf',
    fileSize: '3.2 MB',
    status: 'PROCESSED',
    tags: ['Blueprints', 'Electrical'],
    uploadDate: 'Oct 21, 2023',
  },
  {
    id: '5',
    fileName: 'Permit_Extension_Q4.pdf',
    fileSize: '0.5 MB',
    status: 'QUEUED',
    tags: ['Permits'],
    uploadDate: 'Oct 20, 2023',
  },
];

export default function Documents() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (id) {
      const doc = mockDocuments.find((d) => d.id === id);
      setSelectedDocument(doc || null);
    } else {
      setSelectedDocument(null);
    }
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
      setSelectedIds(new Set(mockDocuments.map((d) => d.id)));
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
            <span>Showing 1-{mockDocuments.length} of {mockDocuments.length}</span>
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

        <DocumentTable
          documents={mockDocuments}
          selectedDocumentId={selectedDocument?.id || null}
          selectedIds={selectedIds}
          onSelectDocument={handleSelectDocument}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
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
