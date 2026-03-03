import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { JobsTable } from '../components/jobs/JobsTable';
import { JobDrawer } from '../components/jobs/JobDrawer';

// Mock data
const mockJobs: Job[] = [
  {
    id: '8291',
    type: 'EXPORT',
    title: 'Export PDF Bundle',
    status: 'COMPLETED',
    createdAt: 'Today, 10:23 AM',
    createdBy: 'Sarah M.',
    completedAt: 'Oct 26, 10:25 AM',
    duration: '2m 14s',
    fileSize: '45.2 MB',
    fileCount: 18,
  },
  {
    id: '8292',
    type: 'INDEX',
    title: 'Index Site Plans',
    status: 'PROCESSING',
    createdAt: 'Today, 09:45 AM',
    createdBy: 'System',
    fileCount: 12,
  },
  {
    id: '8288',
    type: 'EXTRACT',
    title: 'Export Daily Logs',
    status: 'FAILED',
    createdAt: 'Yesterday, 04:15 PM',
    createdBy: 'Mike R.',
    errorMessage: 'Insufficient permissions to access log directory',
  },
  {
    id: '8285',
    type: 'INDEX',
    title: 'Index Safety Reports',
    status: 'COMPLETED',
    createdAt: 'Yesterday, 02:00 PM',
    createdBy: 'Sarah M.',
    completedAt: 'Yesterday, 02:15 PM',
    duration: '15m 23s',
  },
  {
    id: '8280',
    type: 'EXPORT',
    title: 'Export Blueprints',
    status: 'COMPLETED',
    createdAt: 'Oct 24, 11:30 AM',
    createdBy: 'Admin',
    completedAt: 'Oct 24, 11:35 AM',
    duration: '5m 12s',
    fileSize: '89.7 MB',
  },
];

export default function Jobs() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (id) {
      const job = mockJobs.find((j) => j.id === id);
      setSelectedJob(job || null);
    } else {
      setSelectedJob(null);
    }
  }, [id]);

  const handleSelectJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleCloseDrawer = () => {
    navigate('/jobs');
  };

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="h-12 border-b border-border-subtle flex items-center justify-between px-6 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span className="font-medium text-text-main">All Jobs</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
            <span>Sorted by Date</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-background-subtle rounded text-text-muted hover:text-text-main transition-colors">
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button className="p-1.5 hover:bg-background-subtle rounded text-text-muted hover:text-text-main transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-1.5 hover:bg-background-subtle rounded text-text-muted hover:text-text-main transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>

        <JobsTable jobs={mockJobs} onSelectJob={handleSelectJob} />

        {selectedJob && (
          <>
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-20"></div>
            <JobDrawer job={selectedJob} onClose={handleCloseDrawer} />
          </>
        )}
      </main>
    </>
  );
}
