'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useFolder, useFolderTree } from '@/lib/hooks/useFolders';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameFolderDialog } from '@/components/dialogs/RenameFolderDialog';
import { DeleteFolderDialog } from '@/components/dialogs/DeleteFolderDialog';
import { Upload, Grid3x3, List, Search, Menu, X, Folder, Image as ImageIcon, ChevronRight, ChevronDown, Info, MoreVertical, Trash2, FolderPlus } from 'lucide-react';
import type { FolderTree, PhotoFile } from '@/types';
import { ImagePreviewModal } from '@/components/gallery/ImagePreviewModal';
import Link from 'next/link';
import { getThumbnailUrl } from '@/lib/utils';
import { useDeleteFile } from '@/lib/hooks/useUpload';
import { FileUpload } from '@/components/upload/FileUpload';

// Recursive folder tree component
function FolderTreeNode({ 
  folder, 
  currentFolderId, 
  expandedFolders, 
  onToggle,
  onRename,
  onDelete,
  onCreateSubfolder 
}: { 
  folder: FolderTree; 
  currentFolderId: string;
  expandedFolders: Set<string>;
  onToggle: (id: string) => void;
  onRename: (folder: FolderTree) => void;
  onDelete: (folder: FolderTree) => void;
  onCreateSubfolder: (parentId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isExpanded = expandedFolders.has(folder.id);
  const isCurrent = folder.id === currentFolderId;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div className="relative group">
        <Link
          href={`/admin/folder/${folder.id}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isCurrent 
              ? 'bg-gray-100 text-gray-900 font-medium border border-gray-300' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggle(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate flex-1">{folder.name}</span>
          {folder.file_count !== undefined && folder.file_count > 0 && (
            <span className="text-xs text-gray-500 flex-shrink-0 mr-1">{folder.file_count}</span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity flex-shrink-0"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
        </Link>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg z-20 border border-gray-200 py-1">
              <button
                onClick={() => {
                  onCreateSubfolder(folder.id);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FolderPlus className="w-3 h-3" />
                New Subfolder
              </button>
              <button
                onClick={() => {
                  onRename(folder);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  onDelete(folder);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {folder.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              currentFolderId={currentFolderId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const folderId = params.folderId as string;

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([folderId]));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PhotoFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [infoFile, setInfoFile] = useState<PhotoFile | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderTree | null>(null);

  // Get current folder data
  const { data: folder, isLoading, refetch } = useFolder(folderId);
  const { data: folderTree } = useFolderTree();
  const deleteFile = useDeleteFile();

  // Helper to find all parent folder IDs
  const findParentFolders = (tree: FolderTree[] | undefined, targetId: string, parents: string[] = []): string[] | null => {
    if (!tree) return null;
    for (const folderItem of tree) {
      if (folderItem.id === targetId) return parents;
      if (folderItem.children?.length) {
        const result = findParentFolders(folderItem.children, targetId, [...parents, folderItem.id]);
        if (result) return result;
      }
    }
    return null;
  };

  // Expand parent folders when navigating
  useEffect(() => {
    if (folderTree) {
      const parents = findParentFolders(folderTree, folderId);
      if (parents) {
        setExpandedFolders(prev => {
          const expanded = new Set(prev);
          parents.forEach(id => expanded.add(id));
          expanded.add(folderId);
          return expanded;
        });
      }
    }
  }, [folderId, folderTree]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    return folder?.files
      .filter(file => file.original_name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.original_name.localeCompare(b.original_name);
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }) || [];
  }, [folder?.files, searchQuery, sortBy]);

  // Handle opening image from URL on mount
  useEffect(() => {
    const imageId = searchParams.get('file');
    if (imageId && filteredFiles.length > 0 && selectedFile?.id !== imageId) {
      const index = filteredFiles.findIndex(f => f.id === imageId);
      if (index !== -1) {
        setSelectedFile(filteredFiles[index]);
        setSelectedIndex(index);
      }
    } else if (!imageId && selectedFile) {
      setSelectedFile(null);
    }
  }, [searchParams, filteredFiles]);

  const handleImageClick = (file: PhotoFile, index: number) => {
    setSelectedFile(file);
    setSelectedIndex(index);
    router.push(`/admin/folder/${folderId}?file=${file.id}`, { scroll: false });
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
    router.push(`/admin/folder/${folderId}`, { scroll: false });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % filteredFiles.length
      : (selectedIndex - 1 + filteredFiles.length) % filteredFiles.length;
    setSelectedIndex(newIndex);
    setSelectedFile(filteredFiles[newIndex]);
    router.push(`/admin/folder/${folderId}?file=${filteredFiles[newIndex].id}`, { scroll: false });
  };

  const handleDelete = async (file: PhotoFile) => {
    if (confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      try {
        await deleteFile.mutateAsync({ id: file.id, folderId: file.folder_id });
        setMenuOpenFor(null);
        refetch();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Folder not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Floating Sidebar */}
      <aside
        className={`fixed top-6 left-6 bottom-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-transform duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={() => {
                setCreateFolderParent(null);
                setShowCreateDialog(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <FolderPlus className="w-4 h-4" />
              Create Folder
            </button>
          </div>

          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              <Folder className="w-4 h-4" />
              All Folders
            </Link>
            {folderTree?.map((folder) => (
              <FolderTreeNode
                key={folder.id}
                folder={folder}
                currentFolderId={folderId}
                expandedFolders={expandedFolders}
                onToggle={toggleFolder}
                onRename={setFolderToRename}
                onDelete={setFolderToDelete}
                onCreateSubfolder={(parentId) => {
                  setCreateFolderParent(parentId);
                  setShowCreateDialog(true);
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[22rem]' : 'ml-0'} flex-1`}>
        <header className="sticky top-0 z-20 bg-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{folder.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredFiles.length} {filteredFiles.length === 1 ? 'photo' : 'photos'}
                  {folder.subfolders.length > 0 && (
                    <> • {folder.subfolders.length} {folder.subfolders.length === 1 ? 'folder' : 'folders'}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className={`flex-wrap gap-2 ${searchOpen ? 'flex' : 'hidden md:flex'}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              {viewMode === 'grid' && (
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="small">S</option>
                  <option value="medium">M</option>
                  <option value="large">L</option>
                </select>
              )}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUpload ? 'bg-gray-200 text-gray-700' : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                {showUpload ? 'Hide' : 'Upload'}
              </button>
            </div>
          </div>
        </header>

        <div className="px-8 pt-4 pb-8">
          {showUpload && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <FileUpload
                folderId={folderId}
                onComplete={() => {
                  refetch();
                  setShowUpload(false);
                }}
              />
            </div>
          )}

          {folder.subfolders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {folder.subfolders.map((subfolder) => (
                  <Link
                    key={subfolder.id}
                    href={`/admin/folder/${subfolder.id}`}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
                  >
                    <Folder className="w-8 h-8 mb-3 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    <p className="text-sm font-medium text-gray-900 truncate">{subfolder.name}</p>
                    {subfolder.file_count !== undefined && subfolder.file_count > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {subfolder.file_count} {subfolder.file_count === 1 ? 'photo' : 'photos'}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredFiles.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Photos</h3>
              {viewMode === 'grid' ? (
                <div className={`grid gap-4 ${
                  gridSize === 'small' ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' :
                  gridSize === 'large' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                  {filteredFiles.map((file, index) => (
                    <div
                      key={file.id}
                      onClick={() => handleImageClick(file, index)}
                      className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-gray-900 transition-all cursor-pointer"
                    >
                      {file.thumbnail_key ? (
                        <img
                          src={getThumbnailUrl(file.thumbnail_key) || ''}
                          alt={file.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoFile(file);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="View info"
                      >
                        <Info className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(menuOpenFor === file.id ? null : file.id);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-700" />
                      </button>
                      {menuOpenFor === file.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuOpenFor(null); }} />
                          <div className="absolute top-12 left-2 w-40 bg-white rounded-lg shadow-lg z-30 border border-gray-200 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file);
                              }}
                              className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs truncate">{file.original_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file, index) => (
                    <div
                      key={file.id}
                      onClick={() => handleImageClick(file, index)}
                      className="group w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {file.thumbnail_key ? (
                          <img
                            src={getThumbnailUrl(file.thumbnail_key) || ''}
                            alt={file.original_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.original_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(file.uploaded_at).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoFile(file);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View info"
                      >
                        <Info className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : folder.files.length > 0 && searchQuery ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No photos match your search</p>
            </div>
          ) : folder.files.length === 0 && folder.subfolders.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">This folder is empty</p>
            </div>
          ) : null}
        </div>
      </main>

      {selectedFile && folder && (
        <ImagePreviewModal
          file={selectedFile}
          onClose={handleCloseFile}
          onDelete={async () => {
            await handleDelete(selectedFile);
            handleCloseFile();
          }}
          onNext={selectedIndex < filteredFiles.length - 1 ? () => handleNavigate('next') : undefined}
          onPrevious={selectedIndex > 0 ? () => handleNavigate('prev') : undefined}
          nextFile={selectedIndex < filteredFiles.length - 1 ? filteredFiles[selectedIndex + 1] : undefined}
          previousFile={selectedIndex > 0 ? filteredFiles[selectedIndex - 1] : undefined}
        />
      )}

      {infoFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setInfoFile(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Image Information</h3>
              <button onClick={() => setInfoFile(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm text-gray-900 break-words">{infoFile.original_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Size</p>
                <p className="text-sm text-gray-900">{(infoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {infoFile.width && infoFile.height && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dimensions</p>
                  <p className="text-sm text-gray-900">{infoFile.width} × {infoFile.height} px</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                <p className="text-sm text-gray-900">{infoFile.mime_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Uploaded</p>
                <p className="text-sm text-gray-900">{new Date(infoFile.uploaded_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={showCreateDialog}
        parentId={createFolderParent}
        onClose={() => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
        }}
        onSuccess={(newFolderId: string) => {
          setShowCreateDialog(false);
          setCreateFolderParent(null);
          router.push(`/admin/folder/${newFolderId}`);
        }}
      />

      <RenameFolderDialog
        isOpen={folderToRename !== null}
        folder={folderToRename}
        onClose={() => setFolderToRename(null)}
        onSuccess={() => {
          setFolderToRename(null);
          refetch();
        }}
      />

      <DeleteFolderDialog
        isOpen={folderToDelete !== null}
        folder={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onSuccess={() => {
          setFolderToDelete(null);
          router.push('/admin');
        }}
      />
    </div>
  );
}
