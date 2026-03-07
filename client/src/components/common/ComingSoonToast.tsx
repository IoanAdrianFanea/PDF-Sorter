interface ComingSoonToastProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  phase: string;
}

export function ComingSoonToast({ isOpen, onClose, feature, phase }: ComingSoonToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-medium text-slate-900 dark:text-white">{feature}</span> is planned for <span className="font-medium text-primary">{phase}</span> and will be available in a future update.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            We're working hard to bring you new features. Stay tuned for updates!
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
