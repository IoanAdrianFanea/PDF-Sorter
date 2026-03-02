import type { Document } from '../../model_data/mockData';

interface PreviewPanelProps {
  document: Document | null;
}

export default function PreviewPanel({ document }: PreviewPanelProps) {
  if (!document) {
    return (
      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Document Preview
          </h2>
        </div>
        <div className="flex items-center justify-center h-96 text-slate-400 dark:text-slate-500">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl mb-2">description</span>
            <p className="text-sm">Select a document to preview</p>
          </div>
        </div>
      </section>
    );
  }

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
    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Document Preview
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preview Area */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-slate-100 to-slate-200 dark:from-primary/20 dark:via-slate-900 dark:to-slate-800"></div>
            <span className="material-symbols-outlined mb-2 text-6xl text-slate-300 dark:text-slate-600">
              {fileIcon.icon}
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preview of {document.fileName}
            </p>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:bg-slate-800/90 dark:text-slate-200">
                <span className="material-symbols-outlined text-[18px]">
                  zoom_out
                </span>
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:bg-slate-800/90 dark:text-slate-200">
                <span className="material-symbols-outlined text-[18px]">
                  zoom_in
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="col-span-1 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded ${fileIcon.bg}`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {fileIcon.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {document.fileName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {document.fileType.toUpperCase()} Document • {document.fileSize}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-primary dark:hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Source Folder
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    folder
                  </span>
                  {document.sourceFolder}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Date Uploaded
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    calendar_today
                  </span>
                  {document.uploadDate} at 10:45 AM
                </p>
              </div>

              {document.author && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Author
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      person
                    </span>
                    {document.author}
                  </p>
                </div>
              )}

              {document.tags && document.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined">download</span>
              Download Original
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
