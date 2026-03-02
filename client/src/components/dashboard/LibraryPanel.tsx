import type { Document } from '../../model_data/mockData';
import type { GroupByMode } from '../../pages/DashboardPage';
import DocumentRow from './DocumentRow';
import CategoryHeader from './CategoryHeader';

interface LibraryPanelProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  groupBy: GroupByMode;
  onOrganize: (mode: GroupByMode) => void;
  onReset: () => void;
}

export default function LibraryPanel({
  documents,
  onDocumentSelect,
  groupBy,
  onOrganize,
  onReset,
}: LibraryPanelProps) {
  // Group documents based on groupBy mode
  const groupedDocuments = groupBy
    ? documents.reduce((acc, doc) => {
        let key: string;
        switch (groupBy) {
          case 'category':
            key = doc.category;
            break;
          case 'source':
            key = doc.sourceFolder;
            break;
          case 'date':
            key = doc.uploadDate;
            break;
          case 'name':
            key = doc.fileName[0].toUpperCase();
            break;
          default:
            key = 'All';
        }
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(doc);
        return acc;
      }, {} as Record<string, Document[]>)
    : null;

  const getOrganizeLabel = () => {
    switch (groupBy) {
      case 'category':
        return 'Category';
      case 'source':
        return 'Source Folder';
      case 'date':
        return 'Upload Date';
      case 'name':
        return 'File Name';
      default:
        return 'None';
    }
  };

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Search documents..."
              type="text"
            />
          </div>

          <div className="relative flex gap-2 items-center">
            <button className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span className="material-symbols-outlined text-[20px]">
                filter_list
              </span>
              Filter
            </button>

            <div className="relative group">
              <button className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="material-symbols-outlined text-[20px]">
                  folder_special
                </span>
                Organize
                <span className="material-symbols-outlined text-[18px]">
                  expand_more
                </span>
              </button>
              <div className="absolute left-0 top-full mt-2 hidden w-48 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:flex z-20 dark:border-slate-700 dark:bg-slate-800">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => onOrganize('category')}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      auto_awesome
                    </span>
                    Category (AI)
                  </span>
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => onOrganize('source')}
                >
                  Source Folder
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => onOrganize('date')}
                >
                  Upload Date
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => onOrganize('name')}
                >
                  File Name
                </button>
              </div>
            </div>

            <button
              className="flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Reset View"
              onClick={onReset}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              Reset
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-slate-800">
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
              Export
              <span className="material-symbols-outlined text-[18px]">
                expand_more
              </span>
            </button>
            <div className="absolute right-0 top-full mt-2 hidden w-56 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:flex z-10 dark:border-slate-700 dark:bg-slate-800">
              <a
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                href="#"
              >
                Export All
              </a>
              <a
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                href="#"
              >
                Export Selected
              </a>
              <a
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-200 dark:hover:bg-slate-700"
                href="#"
              >
                Export Current Search Results
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-700 flex flex-col h-[600px]">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Documents
              </h3>
              <span className="text-xs text-slate-400 font-medium mt-0.5 dark:text-slate-500">
                Organized by: {getOrganizeLabel()}
              </span>
            </div>
            {groupBy && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[14px] spinner">
                  sync
                </span>
                Organizing...
              </div>
            )}
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            {documents.length} Files
          </span>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 border-collapse">
            <thead className="bg-white text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 sticky-header sticky top-0 z-10 shadow-sm">
              <tr>
                <th
                  className="px-6 py-3 w-10 bg-white dark:bg-slate-900"
                  scope="col"
                >
                  <input
                    className="rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                    type="checkbox"
                  />
                </th>
                <th
                  className="px-6 py-3 font-semibold bg-white dark:bg-slate-900"
                  scope="col"
                >
                  File Name
                </th>
                <th
                  className="px-6 py-3 font-semibold bg-white dark:bg-slate-900"
                  scope="col"
                >
                  Source Folder
                </th>
                <th
                  className="px-6 py-3 font-semibold bg-white dark:bg-slate-900"
                  scope="col"
                >
                  Upload Date
                </th>
                <th
                  className="px-6 py-3 font-semibold bg-white dark:bg-slate-900"
                  scope="col"
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 font-semibold text-right bg-white dark:bg-slate-900"
                  scope="col"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {groupedDocuments ? (
                Object.entries(groupedDocuments).map(([groupKey, docs]) => (
                  <>
                    <CategoryHeader
                      key={`group-${groupKey}`}
                      category={groupKey}
                      count={docs.length}
                    />
                    {docs.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        document={doc}
                        onPreview={onDocumentSelect}
                      />
                    ))}
                  </>
                ))
              ) : (
                documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onPreview={onDocumentSelect}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50 shrink-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-white">1</span>{' '}
            to <span className="font-medium text-slate-900 dark:text-white">6</span> of{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {documents.length}
            </span>{' '}
            results
          </p>
          <div className="flex gap-2">
            <button className="rounded border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
              Previous
            </button>
            <button className="rounded border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
