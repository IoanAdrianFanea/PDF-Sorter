import type { DocumentStatus } from '../../types';

interface StatusBadgeProps {
  status: DocumentStatus;
  errorMessage?: string;
}

const statusStyles: Record<DocumentStatus, { label: string; className: string }> = {
  PROCESSED: {
    label: 'Processed',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  UPLOADED: {
    label: 'Uploaded',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  QUEUED: {
    label: 'Queued',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function StatusBadge({ status, errorMessage }: StatusBadgeProps) {
  const { label, className } = statusStyles[status];
  const tooltip = status === 'FAILED' ? errorMessage : undefined;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
      title={tooltip}
    >
      {label}
    </span>
  );
}
