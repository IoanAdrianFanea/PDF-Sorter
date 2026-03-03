import type { Job } from '../../types';

interface JobsTableProps {
  jobs: Job[];
  onSelectJob: (id: string) => void;
}

export function JobsTable({ jobs, onSelectJob }: JobsTableProps) {
  const getStatusBadge = (status: Job['status']) => {
    const variants = {
      COMPLETED: {
        bg: 'bg-green-50 text-green-700 border-green-100',
        dot: 'bg-green-500',
        text: 'Completed',
      },
      PROCESSING: {
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        dot: 'bg-blue-500 animate-pulse',
        text: 'Processing',
      },
      FAILED: {
        bg: 'bg-red-50 text-red-700 border-red-100',
        dot: 'bg-red-500',
        text: 'Failed',
      },
      PENDING: {
        bg: 'bg-slate-50 text-slate-700 border-slate-100',
        dot: 'bg-slate-500',
        text: 'Pending',
      },
    };

    const variant = variants[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} border`}>
        <span className={`size-1.5 rounded-full ${variant.dot}`}></span>
        {variant.text}
      </span>
    );
  };

  const getTypeIcon = (type: Job['type']) => {
    const icons = {
      EXPORT: { icon: 'picture_as_pdf', color: 'bg-blue-50 text-blue-600' },
      INDEX: { icon: 'content_copy', color: 'bg-indigo-50 text-indigo-600' },
      EXTRACT: { icon: 'summarize', color: 'bg-orange-50 text-orange-600' },
    };
    return icons[type];
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider w-1/3">Job Type</th>
            <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider w-1/6">Status</th>
            <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider w-1/4">Created Time</th>
            <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider text-right w-1/6">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {jobs.map((job) => {
            const typeConfig = getTypeIcon(job.type);
            return (
              <tr
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="group hover:bg-background-subtle transition-colors cursor-pointer"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${typeConfig.color} rounded-md`}>
                      <span className="material-symbols-outlined text-[20px]">{typeConfig.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-main">{job.title}</p>
                      <p className="text-xs text-text-muted">
                        #{job.id} • {job.fileSize || `${job.fileCount} Files`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                <td className="py-3 px-4">
                  <p className="text-sm text-text-main">{job.createdAt}</p>
                  <p className="text-xs text-text-muted">by {job.createdBy}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    className={`text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
                      job.status === 'FAILED' ? 'text-red-600 hover:text-red-700' : 'text-text-muted hover:text-accent'
                    }`}
                  >
                    {job.status === 'FAILED' ? 'Retry' : 'View Details'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
