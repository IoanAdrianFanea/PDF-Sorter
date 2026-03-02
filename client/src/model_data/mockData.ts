export interface Document {
  id: string;
  fileName: string;
  sourceFolder: string;
  uploadDate: string;
  status: 'indexed' | 'processing' | 'error';
  category: string;
  fileType: 'pdf' | 'docx';
  fileSize: string;
  author?: string;
  tags?: string[];
}

export const mockDocuments: Document[] = [
  {
    id: '1',
    fileName: 'Contract_Q3_Final.pdf',
    sourceFolder: '/Contracts/2023',
    uploadDate: 'Oct 24, 2023',
    status: 'indexed',
    category: 'Contracts',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    author: 'Jane Doe',
    tags: ['contract', 'legal', 'final'],
  },
  {
    id: '2',
    fileName: 'Contract_Vendor_A.pdf',
    sourceFolder: '/Contracts/Vendors',
    uploadDate: 'Oct 19, 2023',
    status: 'indexed',
    category: 'Contracts',
    fileType: 'pdf',
    fileSize: '1.8 MB',
  },
  {
    id: '3',
    fileName: 'Meeting_Notes_Oct.docx',
    sourceFolder: '/Minutes',
    uploadDate: 'Oct 23, 2023',
    status: 'processing',
    category: 'Meeting Minutes',
    fileType: 'docx',
    fileSize: '450 KB',
  },
  {
    id: '4',
    fileName: 'Financial_Report_Q2.pdf',
    sourceFolder: '/Finance',
    uploadDate: 'Oct 20, 2023',
    status: 'indexed',
    category: 'Financials',
    fileType: 'pdf',
    fileSize: '3.2 MB',
  },
  {
    id: '5',
    fileName: 'Invoice_00432.pdf',
    sourceFolder: '/Finance/Invoices',
    uploadDate: 'Oct 21, 2023',
    status: 'indexed',
    category: 'Financials',
    fileType: 'pdf',
    fileSize: '890 KB',
  },
  {
    id: '6',
    fileName: 'Invalid_Scan_001.pdf',
    sourceFolder: '/Uploads',
    uploadDate: 'Oct 22, 2023',
    status: 'error',
    category: 'Uncategorized',
    fileType: 'pdf',
    fileSize: '650 KB',
  },
];
