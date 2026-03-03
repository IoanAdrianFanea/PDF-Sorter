import type { Job } from '../../types';

interface JobDrawerProps {
  job: Job;
  onClose: () => void;
}

export function JobDrawer({ job, onClose }: JobDrawerProps) {
  const getStatusBadge = () => {
    const variants = {
      COMPLETED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-slate-100 text-slate-800',
    };
    return variants[job.status];
  };

  const getTypeIcon = () => {
    const icons = {
      EXPORT: { icon: 'folder_zip', color: 'bg-blue-100 text-blue-600 border-blue-200' },
      INDEX: { icon: 'content_copy', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
      EXTRACT: { icon: 'summarize', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    };
    return icons[job.type];
  };

  const typeConfig = getTypeIcon();
  const sampleFiles = job.files || [
    'Site_A_Floor_Plan_L1.pdf',
    'Site_A_Floor_Plan_L2.pdf',
    'Electrical_Schematics_v4.pdf',
  ];

  return (
    <div className="absolute top-2 bottom-2 right-2 w-[440px] bg-white rounded-xl shadow-2xl border border-border-subtle z-30 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between p-6 border-b border-border-subtle bg-background-subtle/30">
        <div className="flex items-center gap-4">
          <div className={`size-12 rounded-lg ${typeConfig.color} flex items-center justify-center border`}>
            <span className="material-symbols-outlined text-[28px]">{typeConfig.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-text-main">{job.title}</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${getStatusBadge()}`}
              >
                {job.status}
              </span>
            </div>
            <p className="text-sm text-text-muted">#{job.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-main hover:bg-background-subtle p-1.5 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {job.status === 'COMPLETED' && (
          <div className="mb-8 p-4 bg-background-subtle rounded-lg border border-border-subtle flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-main mb-0.5">Ready for download</p>
              <p className="text-xs text-text-muted">File size: {job.fileSize || '45.2 MB'}</p>
            </div>
            <button className="bg-primary hover:bg-primary-light text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download ZIP
            </button>
          </div>
        )}

        {job.status === 'FAILED' && job.errorMessage && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
            <div>
              <p className="text-sm font-medium text-red-900 mb-0.5">Job Failed</p>
              <p className="text-xs text-red-700">{job.errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Started By</p>
            <div className="flex items-center gap-2">
              <div
                className="size-6 rounded-full bg-slate-200"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBH0qGVJJOsPPp2XezXcjwCSMz3MfCZWiiZOLzQlnH8uutaVsRg2NdRlBVachj5zTfb1-QEiByDzo8wAhGDF3EpNRZ7SRXfqDVb-jFUoPbq1kOcipRXcSxVUa2a2eBdcBLsKo9LZfaLo6SInhBI1aLxINPJRIbMQRm2B3Oujrs1ZGSoIhildaCz4JwmR0hRvCa_ROewEu-XG1IfHasRGjFzS2cMZQFQAN1pudjQ7997gw5gaUQ-SA-MAU_PORjGZ59g43PaP9kO7Y8")',
                  backgroundSize: 'cover',
                }}
              />
              <span className="text-sm text-text-main">{job.createdBy}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Duration</p>
            <span className="text-sm text-text-main">{job.duration || 'N/A'}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Started</p>
            <span className="text-sm text-text-main">{job.createdAt}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Finished</p>
            <span className="text-sm text-text-main">{job.completedAt || 'N/A'}</span>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6">
          <h3 className="text-sm font-semibold text-text-main mb-4">
            Included Files ({job.fileCount || sampleFiles.length})
          </h3>
          <div className="space-y-3">
            {sampleFiles.map((file) => (
              <div
                key={file}
                className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle hover:bg-background-subtle transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">picture_as_pdf</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main truncate">{file}</p>
                  <p className="text-xs text-text-muted">2.4 MB</p>
                </div>
                <span className="material-symbols-outlined text-text-muted opacity-0 group-hover:opacity-100 text-[18px]">
                  visibility
                </span>
              </div>
            ))}
          </div>
          {job.fileCount && job.fileCount > 3 && (
            <button className="w-full mt-3 py-2 text-xs font-medium text-text-muted hover:text-text-main bg-background-subtle hover:bg-slate-100 rounded border border-transparent hover:border-border-subtle transition-colors">
              Show all {job.fileCount} files
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border-subtle bg-background-subtle/30 flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-background-subtle rounded-md transition-colors">
          Share
        </button>
        <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
          Delete Job
        </button>
      </div>
    </div>
  );
}
