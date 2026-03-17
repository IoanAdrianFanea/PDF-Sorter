export type DocumentStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  status: DocumentStatus;
  uploadDate: string;
  uploadedBy?: string;
  pageCount?: number;
  extractedText?: string;
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type JobType = 'EXPORT' | 'INDEX' | 'EXTRACT';

export interface Job {
  id: string;
  type: JobType;
  title: string;
  status: JobStatus;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  duration?: string;
  fileSize?: string;
  fileCount?: number;
  files?: string[];
  errorMessage?: string;
}
