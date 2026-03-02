import type { Document } from '../../model_data/mockData';

interface DocumentRowProps {
  document: Document;
  onPreview: (document: Document) => void;
}

export default function DocumentRow({ document, onPreview }: DocumentRowProps) {
  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      indexed: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-400',
        dotBg: 'bg-emerald-500',
        label: 'Indexed',
      },
      processing: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-400',
        dotBg: 'bg-amber-500',
        label: 'Processing',
        pulse: true,
      },
      error: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dotBg: 'bg-red-500',
        label: 'Error',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dotBg} ${'pulse' in config && config.pulse ? 'animate-pulse' : ''}`}
        ></span>
        {config.label}
      </span>
    );
  };

  const getFileIcon = (fileType: Document['fileType']) => {
    if (fileType === 'pdf') {
      return {
        bg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        icon: 'picture_as_pdf',
      };
    }
    return {
      bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      icon: 'description',
    };
  };

  const fileIcon = getFileIcon(document.fileType);

  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4">
        <input
          className="rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
          type="checkbox"
        />
      </td>
      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded ${fileIcon.bg}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {fileIcon.icon}
          </span>
        </div>
        {document.fileName}
      </td>
      <td className="px-6 py-4">{document.sourceFolder}</td>
      <td className="px-6 py-4">{document.uploadDate}</td>
      <td className="px-6 py-4">{getStatusBadge(document.status)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700 transition-colors"
            title={document.status === 'error' ? 'Retry' : 'Preview'}
            onClick={() => onPreview(document)}
          >
            <span className="material-symbols-outlined text-[20px]">
              {document.status === 'error' ? 'refresh' : 'visibility'}
            </span>
          </button>
          <button
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
