import { useState, useEffect, type ReactNode, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { tagsService, type Tag } from '../../api/tags';
import { ComingSoonToast } from '../common/ComingSoonToast';

interface TagsContextType {
  tags: Tag[];
  refreshTags: () => Promise<void>;
  onTagDeleted?: (tagId: string) => void;
}

const TagsContext = createContext<TagsContextType | null>(null);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within AppShell');
  }
  return context;
};

// Callback registry for tag deletion notifications
let tagDeletedCallbacks: ((tagId: string) => void)[] = [];

export const registerTagDeleteCallback = (callback: (tagId: string) => void) => {
  tagDeletedCallbacks.push(callback);
  return () => {
    tagDeletedCallbacks = tagDeletedCallbacks.filter(cb => cb !== callback);
  };
};

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<{ feature: string; phase: string } | null>(null);
  
  const isDocumentsPage = location.pathname.startsWith('/documents');
  const isJobsPage = location.pathname.startsWith('/jobs');
  const isSearchPage = location.pathname.startsWith('/search');

  // Fetch tags function
  const fetchTags = async () => {
    try {
      const fetchedTags = await tagsService.listTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      await tagsService.createTag(newTagName.trim());
      await fetchTags(); // Refresh tags list
      setNewTagName('');
      setIsCreatingTag(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Delete tag "${tagName}"? This will remove it from all documents.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await tagsService.deleteTag(tagId);
      await fetchTags(); // Refresh tags list
      
      // Notify all registered callbacks
      tagDeletedCallbacks.forEach(callback => callback(tagId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tag');
    } finally {
      setIsLoading(false);
    }
  };

  const getTagColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-slate-400',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  const tagsContextValue: TagsContextType = {
    tags,
    refreshTags: fetchTags,
  };

  return (
    <TagsContext.Provider value={tagsContextValue}>
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden h-screen flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 h-16 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">folder_open</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">DocIndex Manager</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-xl px-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="block w-full p-2 pl-10 text-sm text-slate-900 border border-slate-200 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary transition-all"
              placeholder="Search documents, tags, or content..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <kbd className="inline-flex items-center border border-slate-200 dark:border-slate-600 rounded px-2 text-xs font-sans font-medium text-slate-400 dark:text-slate-500">
                ⌘K
              </kbd>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span>Upload</span>
          </Link>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button 
            onClick={() => setComingSoonFeature({ feature: 'Notifications', phase: 'Phase 2' })}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => setComingSoonFeature({ feature: 'Profile & Account Settings', phase: 'Phase 2' })}
            className="size-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200 dark:border-slate-700 relative hover:ring-2 hover:ring-primary transition-all"
          >
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhXkeqG9nMzUUJF41F_-J5GmPSntziwNSCZeZiVE6rY4AHpWvGZjQEq11sifUOKz4nNGvIWq05WaW5v1m1q5hbwm7VKtfY6oiqm8geQ3Sxl0UpbryjtuD4rGnGNno3uppzOCJgcl2Hx7CKNo0W4I3w6bVZ8Y2in7VBFQ5w4YSI1UxjB4gJn1BRv0Q9xUxoGoBhmxDMy5-7jIjlDOhdFHeJkCPmXiQknCurIfE1JXVNaCxu4m3YbKuAS_vzf9ryK61EBBOwNPBAKxE"
            />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto shrink-0 py-6 px-4">
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Views</h3>
            <nav className="space-y-1">
              <Link
                className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDocumentsPage
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                to="/documents"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                All Documents
              </Link>
              <Link
                className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isSearchPage
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                to="/search"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Search
              </Link>
              <button
                onClick={() => setComingSoonFeature({ feature: 'Favorites', phase: 'Phase 2' })}
                className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
              >
                <span className="material-symbols-outlined text-[20px]">star</span>
                Favorites
              </button>
              <button
                onClick={() => setComingSoonFeature({ feature: 'Recent Documents', phase: 'Phase 2' })}
                className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                Recent
              </button>
              <Link
                className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isJobsPage
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                to="/jobs"
              >
                <span className="material-symbols-outlined text-[20px]">work</span>
                Jobs
              </Link>
            </nav>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</h3>
            </div>
            <div className="space-y-1">
              <label 
                onClick={(e) => {
                  e.preventDefault();
                  setComingSoonFeature({ feature: 'Status Filtering', phase: 'Phase 2' });
                }}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group"
              >
                <input
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-white pointer-events-none"
                  type="checkbox"
                  readOnly
                />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  Processed
                </span>
                <span className="text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">128</span>
              </label>
              <label 
                onClick={(e) => {
                  e.preventDefault();
                  setComingSoonFeature({ feature: 'Status Filtering', phase: 'Phase 2' });
                }}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group"
              >
                <input
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-white pointer-events-none"
                  type="checkbox"
                  readOnly
                />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  Processing
                </span>
                <span className="text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">4</span>
              </label>
              <label 
                onClick={(e) => {
                  e.preventDefault();
                  setComingSoonFeature({ feature: 'Status Filtering', phase: 'Phase 2' });
                }}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group"
              >
                <input
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-white pointer-events-none"
                  type="checkbox"
                  readOnly
                />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  Review Needed
                </span>
                <span className="text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">12</span>
              </label>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</h3>
              <button
                onClick={() => setIsCreatingTag(!isCreatingTag)}
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCreatingTag ? 'close' : 'add'}
                </span>
              </button>
            </div>
            {isCreatingTag && (
              <div className="mb-2 px-2">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateTag();
                      if (e.key === 'Escape') setIsCreatingTag(false);
                    }}
                    placeholder="New tag name..."
                    autoFocus
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleCreateTag}
                    disabled={isLoading || !newTagName.trim()}
                    className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              {tags.length === 0 ? (
                <p className="px-2 py-4 text-xs text-center text-slate-400">
                  No tags yet. Create your first tag!
                </p>
              ) : (
                tags.map((tag, index) => (
                  <div
                    key={tag.id}
                    className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 group transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${getTagColor(index)}`}></span>
                    <span className="flex-1">{tag.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag.id, tag.name);
                      }}
                      disabled={isLoading}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5"
                      title="Delete tag"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-auto px-2">
            <button
              onClick={() => setComingSoonFeature({ feature: 'Storage Analytics', phase: 'Phase 2' })}
              className="w-full bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">storage</span>
                <span>Storage</span>
              </div>
              <div className="w-full bg-white dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-slate-500">7.5 GB of 10 GB used</p>
            </button>
          </div>
        </aside>

        {children}
      </div>
      </div>

      <ComingSoonToast
        isOpen={comingSoonFeature !== null}
        onClose={() => setComingSoonFeature(null)}
        feature={comingSoonFeature?.feature || ''}
        phase={comingSoonFeature?.phase || ''}
      />
    </TagsContext.Provider>
  );
}
