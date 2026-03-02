export default function UploadPanel() {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Upload PDFs
        </h2>
      </div>

      <div className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary/30 bg-slate-50/50 px-6 py-12 transition-all hover:border-primary hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-800/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            Drag & Drop PDFs Here
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supported formats: PDF, DOCX (Max 25MB)
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            Select Files
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
            Upload Folder
          </button>
        </div>
      </div>
    </section>
  );
}
